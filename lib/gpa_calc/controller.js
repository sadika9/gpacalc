var global_student = new Student();
var global_gpa = new Gpa(global_student);

/* notifications by using Android-Toast library */
function notify(message){
    var toast = new Android_Toast({content: message, duration: 2500, position: 'bottom'});
}

$(document).ready(function() { 
    $.each(global_subjects, function(i, el) {
        $('#subjects_combo_in_add_subjects').append(new Option(el.subject, el.code));
        $('#subjects_combo_in_add_course').append(new Option(el.subject, el.code));
    });
    
    $.each(global_grades, function(i, el) {
        $('#grades_combo_in_add_course').append(new Option(el.grade, el.grade));
        $('#grade_combo_in_edit_student_courses_modal').append(new Option(el.grade, el.grade));
    });
    
    showYearDivs();
});


/****************** logic: adding subject and related functions ******************/
$('#add_subject_button').click(function() {
    var e = $('#subjects_combo_in_add_subjects option:selected');
    global_student.addSubject(e.val(), e.text());

    updateMainSubjectsTable();
    updateStudentCoursesTableHeadings();
    updateStudentCoursesTableFooters();
    updateCourseTables();
    updateSubjectGPAs();

    notify("<em>New (Subject):</em> " + e.text());
});

$('#student_main_subjects_table').on('click', '.delete_row_button', function() {
    var tr = $(this).closest('tr');
    tr.css("background-color","#CA3C3C");
    tr.fadeOut(400, function(){
        global_student.removeSubject($('td:nth-child(3)', tr).text());
        notify("<em>Remove (Subject):</em> " + $('td:nth-child(2)', tr).text());
        tr.remove();

        updateMainSubjectsTable();
        updateStudentCoursesTableHeadings();
        updateStudentCoursesTableFooters();
        updateCourseTables();
        updateSubjectGPAs();
    });
    
    return false;
});

function updateMainSubjectsTable() {
    var tbody = document.getElementById("student_main_subjects_table").getElementsByTagName("TBODY")[0];
    tbody.innerHTML = "";

    for (var i = 0, n = global_student.subjects.length; i < n; ++i) {
        var subject = global_student.subjects[i];
        var rowCount = tbody.rows.length;
        var row = tbody.insertRow(rowCount);

        var cell = row.insertCell(0);
        var element = document.createElement("button");
        element.className = "pure-button delete_row_button";
        element.innerHTML = "X";
        cell.appendChild(element);

        row.insertCell(1).appendChild(document.createTextNode(subject.subject));
        row.insertCell(2).appendChild(document.createTextNode(subject.code));
    }
}

function updateStudentCoursesTableHeadings() {
    var nFixedColumns = 7; // number of fixed columns

    // remove subject hedings first
    for (j = 1; j <= 4; ++j) {
        var headRow = document.getElementById("student_courses_year" + j + "_table").tHead.rows[0];

        for (i = headRow.cells.length - 1; i >= nFixedColumns; --i) {
            headRow.deleteCell(i);
        }
    }

    // add subjects
    for (var i = 0, n = global_student.subjects.length; i < n; ++i) {
        for (var j = 1; j <= 4; ++j) {
            var headRow = document.getElementById("student_courses_year" + j + "_table").tHead.rows[0];

            var newTH = document.createElement('th');
            headRow.appendChild(newTH);
            newTH.innerHTML = global_student.subjects[i].code;
        }
    }
}

function updateStudentCoursesTableFooters() {
    var nFixedCells = 4; // number of fixed cells in footer row

    // remove subject hedings first
    for (j = 1; j <= 4; ++j) {
        var footRow = document.getElementById("student_courses_year" + j + "_table").tFoot.rows[0];

        for (i = footRow.cells.length - 1; i >= nFixedCells; --i) {
            footRow.deleteCell(i);
        }
    }

    // add cells for each subject
    for (var i = 0, n = global_student.subjects.length; i < n; ++i) {
        for (var j = 1; j <= 4; ++j) {
            var footRow = document.getElementById("student_courses_year" + j + "_table").tFoot.rows[0];
            footRow.appendChild(document.createElement('td'));
        }
    }
}

$('#subjects_combo_in_add_course').change(function() {
    $('#course_combo_in_add_course').empty();
    
    var subjectCode = $('#subjects_combo_in_add_course option:selected').val();
    
    // insert empty option (workaround to update include in gpa checkbox state)
    $('#course_combo_in_add_course').append(new Option('', ''));
    
    if (subjectCode === "ALL") {
        $.each(global_courses, function(i, el) {
            $('#course_combo_in_add_course').append(new Option(el.code + " - " + el.title, el.code));
        });
    } 
    else {
        $.each(global_courses, function(i, el) {
            if (el.code.indexOf(subjectCode) > -1)
                $('#course_combo_in_add_course').append(new Option(el.code + " - " + el.title, el.code));
        });
    }
});

$('#course_combo_in_add_course').change(function() {
    var courseCode = $('#course_combo_in_add_course option:selected').val();
    $('#include_in_overall_gpa_checkbox_in_add_course')[0].checked = !findGlobalCourseByCode(courseCode).exclude_from_gpa;
});

$('#add_course_button').click(function() {
    var courseCode = $('#course_combo_in_add_course option:selected').val();
    if (courseCode == undefined || courseCode == '')
        return;
    
    var year = Number($('#year_combo_in_add_course option:selected').val());
    
    // check for duplicates before proceed. multiple course entries can be in different years(repeat) but not in same year
    if (global_student.isEnrolled(courseCode, year))
        return;
    
    var semester = Number($('#semester_combo_in_add_course option:selected').val());
    var course = courseFromGlobalCourse(findGlobalCourseByCode(courseCode));
    var grade = $('#grades_combo_in_add_course option:selected').val();

    var repeat = $('#repeat_checkbox_in_add_course')[0].checked;
    var include_in_overall_gpa =  $('#include_in_overall_gpa_checkbox_in_add_course')[0].checked;

    global_student.addCourse(year, semester, course, repeat, grade, include_in_overall_gpa, null);

    updateCourseTables();
    updateOverallGPAs();
    updateSubjectGPAs();
    showYearDivs();
    updateCreditsInTables();

    notify("<em>New (Course):</em> " + course.code + " - " + course.title);
});

$('#student_courses_year1_table,#student_courses_year2_table,#student_courses_year3_table,#student_courses_year4_table').on('click', '.delete_row_button', function() {
    var tr = $(this).closest('tr');
    tr.css("background-color","#CA3C3C");
    tr.fadeOut(400, function(){
        var courseCode = $('td:nth-child(3)', tr).text();
        global_student.removeCourse(courseCode);
        notify("<em>Remove (Course):</em> " + courseCode);
        tr.remove();

        updateOverallGPAs();
        updateSubjectGPAs();
        showYearDivs();
        updateCreditsInTables();

    });
    
    return false;
});

$('#student_courses_year1_table,#student_courses_year2_table,#student_courses_year3_table,#student_courses_year4_table').on('click', '.edit_row_button', function() {
    var tr = $(this).closest('tr');
    var courseCode = $('td:nth-child(3)', tr).text();
    var eC = global_student.getCourseRef(courseCode);

    $('#edit_student_courses_modal_label_show').text(eC.course.code + " - " + eC.course.title);
    $('#edit_student_courses_modal_course_code').text(eC.course.code);
    $('#edit_student_courses_modal_year').text(eC.year);
    $('#edit_student_courses_modal_credits').val(eC.course.credits);
    $('#edit_student_courses_modal_semester').val(eC.semester);
    $('#grade_combo_in_edit_student_courses_modal').val(eC.grade);
    $('#edit_student_courses_modal_repeat')[0].checked = eC.repeat;

    window.location.hash = "#edit_student_courses_modal";
    
    return false;
});

$('#edit_student_courses_modal_save_button').click(function(){
    var eC = global_student.getCourseRef($('#edit_student_courses_modal_course_code').text());

    eC.semester = $('#edit_student_courses_modal_semester').val();
    eC.course.credits = Number($('#edit_student_courses_modal_credits').val());
    eC.grade = $('#grade_combo_in_edit_student_courses_modal').val();
    eC.repeat = $('#edit_student_courses_modal_repeat')[0].checked;
    
    global_student.sortEnrolledCourses();
    
    notify("<em>Update (Course):</em> " +  $('#edit_student_courses_modal_label_show').text());
    
    /** update **/
    updateCourseTables();
    updateOverallGPAs();
    updateSubjectGPAs();
    updateCreditsInTables();
});

function updateCourseTables() {
    for (var i = 1; i <= 4; ++i) {
        document.getElementById("student_courses_year" + i + "_table").getElementsByTagName("TBODY")[0].innerHTML = "";
    }

    for (var i = 0, n1 = global_student.enrolledCourses.length; i < n1; ++i) {
        var eC = global_student.enrolledCourses[i];
        
        var tbody = document.getElementById("student_courses_year" + eC.year + "_table").getElementsByTagName("TBODY")[0];
        var rowCount = tbody.rows.length;
        var row = tbody.insertRow(rowCount);

        var cell = row.insertCell(0);
        eleEditBtn = document.createElement("button");
        eleEditBtn.className = "pure-button edit_row_button";
        eleEditBtn.innerHTML = "E";
        cell.appendChild(eleEditBtn);

        var eleDelBtn = document.createElement("button");
        eleDelBtn.className = "pure-button delete_row_button";
        eleDelBtn.innerHTML = "X";
        cell.appendChild(eleDelBtn);

        row.insertCell(1).appendChild(document.createTextNode(eC.semester));
        row.insertCell(2).appendChild(document.createTextNode(eC.course.code));
        row.insertCell(3).appendChild(document.createTextNode(eC.course.title + (eC.repeat ? " (R)" : "")));
        row.insertCell(4).appendChild(document.createTextNode(eC.course.credits));
        row.insertCell(5).appendChild(document.createTextNode(eC.grade));

        var cell = row.insertCell(6);
        var eleChBx = document.createElement("input");
        eleChBx.type = "checkbox";
        eleChBx.value = "overall_gpa_column";
        eleChBx.checked = eC.include_in_overall_gpa;
        eleChBx.onclick = function () {
            updateIncludeInOverallGPAState(this)
        };
        cell.appendChild(eleChBx);

        for (var j = 0, n2 = global_student.subjects.length; j < n2; ++j) {
            var subj = global_student.subjects[j];
            
            var cell = row.insertCell(j + 7);
            var eleChBx = document.createElement("input");
            eleChBx.type = "checkbox";
            eleChBx.value = subj.code;
            eleChBx.onclick = function () {
                updateIncludeInSubjectGPAState(this)
            };
            eleChBx.checked = false;
            eleChBx.disabled = !eC.include_in_overall_gpa;
            
            if (!eleChBx.disabled) {
                for (var k = 0; k < eC.include_in_subject_gpa.length; ++k) {
                    if (eC.include_in_subject_gpa[k] === subj.code) {
                        eleChBx.checked = true;
                        break;
                    }
                }
            }
            
            cell.appendChild(eleChBx);
        }
    }
}

function showYearDivs() {
    for (var i = 1; i <= 4; ++i) {
        var tbody = document.getElementById("student_courses_year" + i + "_table").getElementsByTagName("TBODY")[0];
        document.getElementById("student_courses_year" + i + "_div").style.display = (tbody.rows.length > 0) ? "block" : "none";
    }
}

/****************** logic: gpa checkbox state and related data structure update ******************/
function updateIncludeInOverallGPAState(object) {
    checkBoxState = object.checked;

    while (object.tagName != 'TR') {
        object = object.parentNode;
    }

    var courseCode = object.getElementsByTagName('TD')[2].innerHTML;
    global_student.setIncludeInOverallGpa(courseCode, checkBoxState);
 
    updateCourseTables();
    updateSubjectGPAs();
    updateOverallGPAs();
    updateCreditsInTables();
}

function updateIncludeInSubjectGPAState(object) {
    var includeSubject = object.checked;
    var subjCode = object.value;

    while (object.tagName != 'TR') {
        object = object.parentNode;
    }

    var courseCode = object.getElementsByTagName('TD')[2].innerHTML;
    global_student.setIncludeInSubjectGpa(courseCode, subjCode, includeSubject);
    
    updateSubjectGPAs();
}

/****************** logic: total credits in table ********************/
function updateCreditsInTables() {
  var sumCreditsIncludedInGpa = 0;
  var sumAllCredits = 0;
  
  for (var i = 1; i <= 4; ++i) {
    var tfoot = document.getElementById("student_courses_year" + i + "_table").getElementsByTagName("TFOOT")[0];
    tfoot.rows[0].cells[1].innerHTML = global_gpa.totalCreditsOfYearInGpa(i) + ' / ' + global_gpa.totalCreditsOfYear(i);
  }
  
  document.getElementById("final_credits").innerHTML = global_gpa.totalCreditsInGpa() + ' / ' + global_gpa.totalCredits();
}

/****************** logic: calculating Overall GPAs ******************/
function updateOverallGPAs() {
    for (var i = 1; i <= 4; ++i) {
        var tfoot = document.getElementById("student_courses_year" + i + "_table").getElementsByTagName("TFOOT")[0];
        tfoot.rows[0].cells[3].innerHTML = global_gpa.overallGpaOfYear(i);
    }

    document.getElementById("final_overall_gpa").innerHTML = global_gpa.overallGpa();
}

/****************** logic: calculating subject GPAs ******************/
function finalSubjectGPA(subjectCode) {
    var divEle = document.getElementById("final_subject_gpas");

    var ele = document.createElement("H4");
    ele.innerHTML = subjectCode;

    ele.innerHTML += ": " + global_gpa.subjectGpa(subjectCode);
    divEle.appendChild(ele);
}

function overallSubjectGPA(year, subjectCode) {
    var tfoot = document.getElementById("student_courses_year" + year + "_table").getElementsByTagName("TFOOT")[0];

    // subject heading order is same as studentSubjects array order
    // so we can use array index to get right footer cell
    var stuSubjIndex = -1;
    for (var i = 0, nStuSubj = global_student.subjects.length; i < nStuSubj; ++i) {
        if (global_student.subjects[i].code === subjectCode) {
            stuSubjIndex = i;
            break;
        }
    }
    if (stuSubjIndex < 0)
        return;

    var nFixedCells = 4; // number of fixed footer cells
    var subjCellIndex = nFixedCells + stuSubjIndex; // index of subject footer cell

    tfoot.rows[0].cells[subjCellIndex].innerHTML = global_gpa.subjectGpaOfYear(year, subjectCode);
}

function updateSubjectGPAs() {
    for (var year = 1; year <= 4; ++year) {
        for (var j = 0, nStuSubj = global_student.subjects.length; j < nStuSubj; ++j) {
            overallSubjectGPA(year, global_student.subjects[j].code);
        }
    }

    document.getElementById("final_subject_gpas").innerHTML = "";
    for (var i = 0, nStuSubj = global_student.subjects.length; i < nStuSubj; ++i) {
        finalSubjectGPA(global_student.subjects[i].code)
    }
}
