/* notifications by using Android-Toast library */
function notify(message){
    var toast = new Android_Toast({content: message, duration: 2500, position: 'bottom'});
}

/****************** popluating combo box values ******************/
for (var i = 0, nSubs = global_subjects.length; i < nSubs; ++i) {
    // adding subjects to main_subject combo
    var x1 = document.createElement("OPTION");
    x1.setAttribute("value", global_subjects[i].code);

    var t1 = document.createTextNode(global_subjects[i].subject);
    x1.appendChild(t1);
    document.getElementById("main_subjects").appendChild(x1);

    // adding subjects to subject_to_filter_courses combo
    var x2 = document.createElement("OPTION");
    x2.setAttribute("value", global_subjects[i].code);

    var t2 = document.createTextNode(global_subjects[i].subject);
    x2.appendChild(t2);
    document.getElementById("subject_to_filter_courses").appendChild(x2);
}

for (var i = 0, nGrades = global_grades.length; i < nGrades; ++i) {
    var grade = global_grades[i].grade;

    var x = document.createElement("OPTION");
    x.setAttribute("value", grade);

    var t = document.createTextNode(grade);
    x.appendChild(t);
    document.getElementById("grade").appendChild(x);

    /** edit course modal grades **/
    x = document.createElement("OPTION");
    x.setAttribute("value", grade);

    t = document.createTextNode(grade);
    x.appendChild(t);
    document.getElementById("edit_student_courses_modal_grade").appendChild(x);
}

/****************** global variables ******************/
var studentSubjects = [];
var studentCourses = [];


/****************** logic: adding subject and related functions ******************/
function addSubject() {
    var element = document.getElementById("main_subjects");

    var subject = {
        subject: element.options[element.selectedIndex].text,
        code: element.options[element.selectedIndex].value
    };

    // check for duplicates
    for (var i = 0, nStuSubj = studentSubjects.length; i < nStuSubj; ++i) {
        if (studentSubjects[i].code === subject.code)
            return;
    }
    studentSubjects.push(subject);
    studentSubjects.sort(function (a, b) {
        if (a.subject < b.subject)
            return -1;
        if (a.subject > b.subject)
            return 1;
        return 0;
    });

    updateMainSubjectsTable();
    updateStudentCoursesTableHeadings();
    updateStudentCoursesTableFooters();
    updateExistingCoursesSubjectGPAStates("add_subject", subject);
    updateCourseTables();
    updateSubjectGPAs();

    notify("<em>New (Subject):</em> " + subject.subject);
}

function removeSubject(object) {
    while (object.tagName != 'TR') {
        object = object.parentNode;
    }

    var subj = "";
    var code = object.getElementsByTagName('TD')[2].innerHTML;
    for (var i = 0, nStuSubj = studentSubjects.length; i < nStuSubj; ++i) {
        if (studentSubjects[i].code === code) {
            subj = studentSubjects[i].subject;
            studentSubjects.splice(i, 1);
            break;
        }
    }
    object.parentNode.removeChild(object);

    updateMainSubjectsTable();
    updateStudentCoursesTableHeadings();
    updateStudentCoursesTableFooters();
    var subject = {
        code: code
    };
    updateExistingCoursesSubjectGPAStates("remove_subject", subject);
    updateCourseTables();
    updateSubjectGPAs();

    notify("<em>Remove (Subject):</em> " + subj);
}

function updateMainSubjectsTable() {
    var tbody = document.getElementById("student_main_subjects_table").getElementsByTagName("TBODY")[0];
    tbody.innerHTML = "";

    for (var i = 0, nStuSubj = studentSubjects.length; i < nStuSubj; ++i) {
        var subject = studentSubjects[i];
        var rowCount = tbody.rows.length;
        var row = tbody.insertRow(rowCount);

        var cell = row.insertCell(0);
        var element = document.createElement("button");
        element.className = "pure-button delete_row_button";
        element.innerHTML = "X";
        element.onclick = function () {
            removeSubject(this)
        };
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
    for (var i = 0, nStuSubj = studentSubjects.length; i < nStuSubj; ++i) {
        for (var j = 1; j <= 4; ++j) {
            var headRow = document.getElementById("student_courses_year" + j + "_table").tHead.rows[0];

            var newTH = document.createElement('th');
            headRow.appendChild(newTH);
            newTH.innerHTML = studentSubjects[i].code;
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
    for (var i = 0, nStuSubj = studentSubjects.length; i < nStuSubj; ++i) {
        for (var j = 1; j <= 4; ++j) {
            var footRow = document.getElementById("student_courses_year" + j + "_table").tFoot.rows[0];

            var newTH = document.createElement('td');
            footRow.appendChild(newTH);
            newTH.innerHTML = "0.00";
        }
    }
}

function updateExistingCoursesSubjectGPAStates(action, subject) {
    if (action === "add_subject") {
        for (var i = 0, nStuCourses = studentCourses.length; i < nStuCourses; ++i) {
            for (var j = 0, nSubjArea = studentCourses[i].course.principal_subject_area.length; j < nSubjArea; ++j) {
                if (studentCourses[i].course.principal_subject_area[j] === subject.code) {
                    studentCourses[i].include_in_subject_gpa.push(subject.code);
                }
            }
        }
    } else {
        for (var i = 0, nStuCourses = studentCourses.length; i < nStuCourses; ++i) {
            var index = studentCourses[i].include_in_subject_gpa.indexOf(subject.code);
            if (index > -1) {
                studentCourses[i].include_in_subject_gpa.splice(index, 1);
            }
        }
    }
}

/****************** logic: adding courses: filtering courses by subject, etc ******************/
function filterCourses() {
    document.getElementById("course").innerHTML = "";

    var element = document.getElementById("subject_to_filter_courses");
    var subjectCode = element.options[element.selectedIndex].value;

    if (subjectCode === "ALL") {
        // insert empty option (workaround to update include in gpa checkbox state)
        var x = document.createElement("OPTION");
        x.setAttribute("value", "");
        //x.appendChild(document.createTextNode());
        document.getElementById("course").appendChild(x);

        for (var i = 0; i < global_courses.length; ++i) {
            var x = document.createElement("OPTION");
            x.setAttribute("value", global_courses[i].code);

            var t = document.createTextNode(global_courses[i].code + " - " + global_courses[i].title);
            x.appendChild(t);
            document.getElementById("course").appendChild(x);
        }
    } else {
        // insert empty option (workaround to update include in gpa checkbox state)
        var x = document.createElement("OPTION");
        x.setAttribute("value", "");
        //x.appendChild(document.createTextNode());
        document.getElementById("course").appendChild(x);

        for (var i = 0; i < global_courses.length; ++i) {
            if (global_courses[i].code.indexOf(subjectCode) > -1) {
                var x = document.createElement("OPTION");
                x.setAttribute("value", global_courses[i].code);

                var t = document.createTextNode(global_courses[i].code + " - " + global_courses[i].title);
                x.appendChild(t);
                document.getElementById("course").appendChild(x);
            }
        }
    }
}

function courseSelectionChanged() {
    var element = document.getElementById("course");
    var courseCode = element.options[element.selectedIndex].value;

    // get course object and update include in gpa checkbox
    for (var i = 0; i < global_courses.length; ++i) {
        if (global_courses[i].code === courseCode) {
            var element = document.getElementById("include_in_overall_gpa_checkbox");
            element.checked = !global_courses[i].exclude_from_gpa;
        }
    }
}

/****************** logic: adding courses and related functions ******************/
function addCourse() {
    var eleCourse = document.getElementById("course");
    if (typeof eleCourse.options[eleCourse.selectedIndex] == 'undefined')
        return;
    var courseCode = eleCourse.options[eleCourse.selectedIndex].value;
    if (courseCode === "")
        return;

    // selected year
    var eleYear = document.getElementById("year");
    var year = Number(eleYear.options[eleYear.selectedIndex].value);

    // selected semester
    var eleSemester = document.getElementById("semester");
    var semester = Number(eleSemester.options[eleSemester.selectedIndex].value);

    // check for duplicates before proceed. 
    // multiple entries of same course can present in different years(repeat) but not in same year
    for (var i = 0; i < studentCourses.length; ++i) {
        if (studentCourses[i].year === year) {
            if (studentCourses[i].course.code === courseCode)
                return;
        }
    }

    // get course
    var course = {}
    for (var i = 0; i < global_courses.length; ++i) {
        if (global_courses[i].code === courseCode) {
            course = global_courses[i];
            break;
        }
    }

    var eleGrade = document.getElementById("grade");
    var grade = eleGrade.options[eleGrade.selectedIndex].value;

    studentCourse = {
        year: year,
        semester: semester,
        course: course,
        repeat: document.getElementById('repeat_checkbox').checked,
        grade: grade,
        include_in_overall_gpa: document.getElementById('include_in_overall_gpa_checkbox').checked,
        include_in_subject_gpa: []
    };

    for (var i = 0; i < studentSubjects.length; ++i) {
        for (var j = 0; j < course.principal_subject_area.length; ++j) {
            if (course.principal_subject_area[j] === studentSubjects[i].code)
                studentCourse.include_in_subject_gpa.push(studentSubjects[i].code);
        }
    }

    studentCourses.push(studentCourse);

    studentCourses.sort(function (a, b) {
        if (a.year < b.year)
            return -1;
        if (a.year > b.year)
            return 1;
        if (a.year == b.year) {
            if (a.semester < b.semester)
                return -1;
            if (a.semester > b.semester)
                return 1;
            if (a.semester == b.semester) {
                if (a.course.code < b.course.code)
                    return -1;
                if (a.course.code > b.course.code)
                    return 1;
                return 0;
            }
        }
    });

    updateCourseTables();
    updateOverallGPAs();
    updateSubjectGPAs();
    showYearDivs();
    updateCreditsInTables();

    notify("<em>New (Course):</em> " + course.code + " - " + course.title);
}

function removeCourse(object) {
    while (object.tagName != 'TR') {
        object = object.parentNode;
    }

    var courseCode = object.getElementsByTagName('TD')[2].innerHTML;
    var courseTitle = "";
    for (var i = 0; i < studentCourses.length; ++i) {
        if (studentCourses[i].course.code === courseCode) {
            courseTitle = studentCourses[i].course.title;
            studentCourses.splice(i, 1);
            break;
        }
    }

    object.parentNode.removeChild(object);

    updateOverallGPAs();
    updateSubjectGPAs();
    showYearDivs();
    updateCreditsInTables();

    notify("<em>Remove (Course):</em> " + courseCode + " - " + courseTitle);
}

function editCourse(object) {
    while (object.tagName != 'TR') {
        object = object.parentNode;
    }

    var courseCode = object.getElementsByTagName('TD')[2].innerHTML;
    for (var i = 0; i < studentCourses.length; ++i) {
        if (studentCourses[i].course.code === courseCode) {
            var stCourse = studentCourses[i];

            document.getElementById("edit_student_courses_modal_label_show").innerHTML = stCourse.course.code + " - " + stCourse.course.title;
            document.getElementById("edit_student_courses_modal_course_code").innerHTML = stCourse.course.code;
            document.getElementById("edit_student_courses_modal_year").innerHTML = stCourse.year;
            document.getElementById("edit_student_courses_modal_credits").value = stCourse.course.credits;
            document.getElementById("edit_student_courses_modal_semester").value = stCourse.semester;
            document.getElementById("edit_student_courses_modal_grade").value = stCourse.grade;
            document.getElementById("edit_student_courses_modal_repeat").checked = stCourse.repeat;

            window.location.hash = "#edit_student_courses_modal";
            return;
        }
    }
}

function saveEditedStudentCourseDetail() {
    var courseCode = document.getElementById("edit_student_courses_modal_course_code").innerHTML;

    for (var i = 0; i < studentCourses.length; ++i) {
        if (studentCourses[i].course.code === courseCode) {
            var stCourse = studentCourses[i];

            stCourse.semester = document.getElementById("edit_student_courses_modal_semester").value;
            stCourse.course.credits = Number(document.getElementById("edit_student_courses_modal_credits").value);
            stCourse.grade = document.getElementById("edit_student_courses_modal_grade").value;
            stCourse.repeat = document.getElementById("edit_student_courses_modal_repeat").checked;

            break;
        }
    }

    notify("<em>Update (Course):</em> " + document.getElementById("edit_student_courses_modal_label_show").innerHTML);

    /* reset modal */
    document.getElementById("edit_student_courses_modal_label_show").innerHTML = "";
    document.getElementById("edit_student_courses_modal_course_code").innerHTML = ""
    document.getElementById("edit_student_courses_modal_year").innerHTML = "";
    document.getElementById("edit_student_courses_modal_semester").value = 0;
    document.getElementById("edit_student_courses_modal_credits").value = 0;
    document.getElementById("edit_student_courses_modal_grade").value = 0;
    document.getElementById("edit_student_courses_modal_repeat").checked = false;

    /** update **/
    updateCourseTables();
    updateOverallGPAs();
    updateSubjectGPAs();
    updateCreditsInTables();
}

function updateCourseTables() {
    for (var i = 1; i <= 4; ++i) {
        document.getElementById("student_courses_year" + i + "_table").getElementsByTagName("TBODY")[0].innerHTML = "";
    }

    for (var i = 0; i < studentCourses.length; ++i) {
        var tbody = document.getElementById("student_courses_year" + studentCourses[i].year + "_table").getElementsByTagName("TBODY")[0];
        var rowCount = tbody.rows.length;
        var row = tbody.insertRow(rowCount);

        var cell = row.insertCell(0);
        eleEditBtn = document.createElement("button");
        eleEditBtn.className = "pure-button edit_row_button";
        eleEditBtn.innerHTML = "E";
        eleEditBtn.onclick = function () {
            editCourse(this)
        };
        cell.appendChild(eleEditBtn);

        var eleDelBtn = document.createElement("button");
        eleDelBtn.className = "pure-button delete_row_button";
        eleDelBtn.innerHTML = "X";
        eleDelBtn.onclick = function () {
            removeCourse(this)
        };
        cell.appendChild(eleDelBtn);

        row.insertCell(1).appendChild(document.createTextNode(studentCourses[i].semester));
        row.insertCell(2).appendChild(document.createTextNode(studentCourses[i].course.code));
        row.insertCell(3).appendChild(document.createTextNode(studentCourses[i].course.title + (studentCourses[i].repeat ? " (R)" : "")));
        row.insertCell(4).appendChild(document.createTextNode(studentCourses[i].course.credits));
        row.insertCell(5).appendChild(document.createTextNode(studentCourses[i].grade));

        var cell = row.insertCell(6);
        var eleChBx = document.createElement("input");
        eleChBx.type = "checkbox";
        eleChBx.value = "overall_gpa_column";
        eleChBx.checked = studentCourses[i].include_in_overall_gpa;
        eleChBx.onclick = function () {
            updateIncludeInOverallGPAState(this)
        };
        cell.appendChild(eleChBx);

        for (var j = 0; j < studentSubjects.length; ++j) {
            var cell = row.insertCell(j + 7);
            var eleChBx = document.createElement("input");
            eleChBx.type = "checkbox";
            eleChBx.value = studentSubjects[j].code;
            eleChBx.onclick = function () {
                updateIncludeInSubjectGPAState(this)
            };
            eleChBx.checked = false;
            eleChBx.disabled = !studentCourses[i].include_in_overall_gpa;
            
            if (!eleChBx.disabled) {
                for (var k = 0; k < studentCourses[i].include_in_subject_gpa.length; ++k) {
                    var subCode = studentCourses[i].include_in_subject_gpa[k];
                    if (subCode === studentSubjects[j].code) {
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
    for (var i = 0; i < studentCourses.length; ++i) {
        if (studentCourses[i].course.code === courseCode) {
            studentCourses[i].include_in_overall_gpa = checkBoxState;
            
            /* update subject gpa states when overall gpa check box changed */
            if (checkBoxState) { 
                studentCourses[i].include_in_subject_gpa = [].concat(studentCourses[i].course.principal_subject_area);
                var idx = studentCourses[i].include_in_subject_gpa.indexOf("Foundation");
                if (idx > -1) {
                    studentCourses[i].include_in_subject_gpa.splice(idx, 1);
                }
            }
            else { /* need to remove current course from all subject gpas if user removes  the course from overall gpa */
                studentCourses[i].include_in_subject_gpa = [];
            }
            
            break;
        }
    }

    updateCourseTables();
    updateSubjectGPAs();
    updateOverallGPAs();
    updateCreditsInTables();
}

function updateIncludeInSubjectGPAState(object) {
    checkBoxState = object.checked;
    subjCode = object.value;

    while (object.tagName != 'TR') {
        object = object.parentNode;
    }

    var courseCode = object.getElementsByTagName('TD')[2].innerHTML;
    for (var i = 0, nStuCourses = studentCourses.length; i < nStuCourses; ++i) {
        var stuCourse = studentCourses[i];

        if (stuCourse.course.code === courseCode) {

            if (checkBoxState === true) {
                stuCourse.include_in_subject_gpa.push(subjCode);
                break;
            } else {
                var index = stuCourse.include_in_subject_gpa.indexOf(subjCode);
                if (index > -1) stuCourse.include_in_subject_gpa.splice(index, 1);
                break;
            }

        }
    }

    updateSubjectGPAs();
}

/****************** logic: total credits in table ********************/
function credits(year) {
    var totCreditsIncludedInGpa = totalCreditsIncludedInGpa(year);
    var totCredits = totalCredits(year);
    

    var tfoot = document.getElementById("student_courses_year" + year + "_table").getElementsByTagName("TFOOT")[0];

    tfoot.rows[0].cells[1].innerHTML = totCreditsIncludedInGpa + ' / ' + totCredits;
}

function updateCreditsInTables() {
  var sumCreditsIncludedInGpa = 0;
  var sumAllCredits = 0;
  
  for (var i = 1; i <= 4; ++i) {
      credits(i);
      
      sumCreditsIncludedInGpa += totalCreditsIncludedInGpa(i);
      sumAllCredits += totalCredits(i);
  }
  
  document.getElementById("final_credits").innerHTML = sumCreditsIncludedInGpa + ' / ' + sumAllCredits;
}

/****************** logic: calculating Overall GPAs ******************/
function totalCredits(year) {
    var totalCredits = 0;

    for (var i = 0, nStuCourses = studentCourses.length; i < nStuCourses; ++i) {
        var stuCourse = studentCourses[i];

        if (stuCourse.year === year) {
            totalCredits += stuCourse.course.credits;
        }
    }

    return totalCredits;
}

function totalCreditsIncludedInGpa(year) {
    var totalCredits = 0;

    for (var i = 0, nStuCourses = studentCourses.length; i < nStuCourses; ++i) {
        var stuCourse = studentCourses[i];

        if (stuCourse.year === year && stuCourse.include_in_overall_gpa === true) {
            totalCredits += stuCourse.course.credits;
        }
    }

    return totalCredits;
}

function totalGradePointIntoCredit(year) {
    var sum = 0;

    for (var i = 0, nStuCourses = studentCourses.length; i < nStuCourses; ++i) {
        var stuCourse = studentCourses[i];

        if (stuCourse.year === year && stuCourse.include_in_overall_gpa === true) {
            sum += stuCourse.course.credits * gradePointOf(stuCourse.grade);
        }
    }

    return sum;
}

function finalOverallGPA() {
    var sumCredits = 0;
    var sumGradePointIntoCredit = 0;

    for (var i = 1; i <= 4; ++i) {
        sumCredits += totalCreditsIncludedInGpa(i);
        sumGradePointIntoCredit += totalGradePointIntoCredit(i);
    }

    if (sumCredits <= 0) {
        document.getElementById("final_overall_gpa").innerHTML = "0.00";
        return;
    }
    var gpa = precise_round(sumGradePointIntoCredit / sumCredits, 2);
    document.getElementById("final_overall_gpa").innerHTML = gpa;
}

function overallGPA(year) {
    var sumCredits = totalCreditsIncludedInGpa(year);
    var sumGradePointIntoCredit = totalGradePointIntoCredit(year);

    var tfoot = document.getElementById("student_courses_year" + year + "_table").getElementsByTagName("TFOOT")[0];

    if (sumCredits <= 0) {
        tfoot.rows[0].cells[3].innerHTML = "0.00";
        return;
    }

    tfoot.rows[0].cells[3].innerHTML = precise_round(sumGradePointIntoCredit / sumCredits, 2);
}

function updateOverallGPAs() {
    for (var i = 1; i <= 4; ++i) {
        overallGPA(i);
    }

    finalOverallGPA();
}

/****************** logic: calculating subject GPAs ******************/
function totalSubjectCredits(year, subjectCode) {
    var totalCredits = 0;

    for (var i = 0, nStuCourses = studentCourses.length; i < nStuCourses; ++i) {
        var stuCourse = studentCourses[i];

        if (stuCourse.year === year && stuCourse.include_in_subject_gpa.indexOf(subjectCode) > -1) {
            totalCredits += stuCourse.course.credits;
        }
    }

    return totalCredits;
}

function totalSubjectGradePointIntoCredit(year, subjectCode) {
    var sum = 0;

    for (var i = 0, nStuCourses = studentCourses.length; i < nStuCourses; ++i) {
        var stuCourse = studentCourses[i];

        if (stuCourse.year === year && stuCourse.include_in_subject_gpa.indexOf(subjectCode) > -1) {
            sum += stuCourse.course.credits * gradePointOf(stuCourse.grade);
        }
    }

    return sum;
}

function finalSubjectGPA(subjectCode) {
    var sumCredits = 0;
    var sumGradePointIntoCredit = 0;

    for (var i = 1; i <= 4; ++i) {
        sumCredits += totalSubjectCredits(i, subjectCode);
        sumGradePointIntoCredit += totalSubjectGradePointIntoCredit(i, subjectCode);
    }

    var divEle = document.getElementById("final_subject_gpas");

    var ele = document.createElement("H4");
    ele.innerHTML = subjectCode;

    if (sumCredits <= 0) {
        ele.innerHTML += ": 0.00";
        divEle.appendChild(ele);
        return;
    }

    var gpa = precise_round(sumGradePointIntoCredit / sumCredits, 2);
    ele.innerHTML += ": " + gpa;
    divEle.appendChild(ele);
}

function overallSubjectGPA(year, subjectCode) {
    var tfoot = document.getElementById("student_courses_year" + year + "_table").getElementsByTagName("TFOOT")[0];

    // subject heading order is same as studentSubjects array order
    // so we can use array index to get right footer cell
    var stuSubjIndex = -1;
    for (var i = 0, nStuSubj = studentSubjects.length; i < nStuSubj; ++i) {
        if (studentSubjects[i].code === subjectCode) {
            stuSubjIndex = i;
            break;
        }
    }
    if (stuSubjIndex < 0)
        return;

    var nFixedCells = 4; // number of fixed footer cells
    var subjCellIndex = nFixedCells + stuSubjIndex; // index of subject footer cell


    var sumCredits = totalSubjectCredits(year, subjectCode);
    var sumGradePointIntoCredit = totalSubjectGradePointIntoCredit(year, subjectCode);

    if (sumCredits <= 0) {
        tfoot.rows[0].cells[subjCellIndex].innerHTML = "0.00";
        return;
    }

    tfoot.rows[0].cells[subjCellIndex].innerHTML = precise_round(sumGradePointIntoCredit / sumCredits, 2);

}

function updateSubjectGPAs() {
    for (var year = 1; year <= 4; ++year) {
        for (var j = 0, nStuSubj = studentSubjects.length; j < nStuSubj; ++j) {
            overallSubjectGPA(year, studentSubjects[j].code);
        }
    }

    document.getElementById("final_subject_gpas").innerHTML = "";
    for (var i = 0, nStuSubj = studentSubjects.length; i < nStuSubj; ++i) {
        finalSubjectGPA(studentSubjects[i].code)
    }
}

/****************** logic: helper functions ******************/
/*** This method from: http://stackoverflow.com/a/16319855 ***/
function precise_round(num, decimals) {
    var sign = num >= 0 ? 1 : -1;
    return (Math.round((num * Math.pow(10, decimals)) + (sign * 0.001)) / Math.pow(10, decimals)).toFixed(decimals);
}

/****************** Saving and loading student data ******************/
function saveStudentData() {
    var data = {
        name: "GPA Calc",
        version: 1,
        studentSubjects: studentSubjects,
        studentCourses: studentCourses
    };

    var blob = new Blob([JSON.stringify(data)], {
        type: "application/json;charset=utf-8"
    });
    saveAs(blob, "MyGPA.gpa");
}

function loadStudentData() {
    var inputEle = document.getElementById("load_file_input");
    if (inputEle) {
        inputEle.click();
    }
}

function handleFile(files) {
    var file = files[0];

    var reader = new FileReader();

    reader.onload = (function (theFile) {
        return function (e) {
            var data = JSON.parse(e.target.result);
            studentSubjects = data.studentSubjects;
            studentCourses = data.studentCourses;

            updateMainSubjectsTable();
            updateStudentCoursesTableHeadings();
            updateStudentCoursesTableFooters();
            updateCourseTables();
            updateSubjectGPAs();
            updateOverallGPAs();
            showYearDivs();
            updateCreditsInTables();
        }
    })(file);

    reader.readAsText(file);
}
