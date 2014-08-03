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
});

$('#add_subject_button').click(function() {
    var e = $('#subjects_combo_in_add_subjects option:selected');
    global_student.addSubject(e.val(), e.text());

    drawSubjectsTable();
    drawCoursesTable();
    updateFinalDetails();

    notify("<em>New (Subject):</em> " + e.text());
});

$('#student_subjects_table').on('click', '.delete_row_button', function() {
    var tr = $(this).closest('tr');
    tr.css("background-color","#CA3C3C");
    tr.fadeOut(400, function(){
        global_student.removeSubject($('td:nth-child(3)', tr).text());
        notify("<em>Remove (Subject):</em> " + $('td:nth-child(2)', tr).text());
        tr.remove();

        drawSubjectsTable();
        drawCoursesTable();
        updateFinalDetails();
    });
    
    return false;
});

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

    drawCoursesTable();
    updateFinalDetails();
    
    notify("<em>New (Course):</em> " + course.code + " - " + course.title);
});

$('#student_courses_table').on('click', '.delete_row_button', function() {
    var tr = $(this).closest('tr');
    tr.css("background-color","#CA3C3C");
    tr.fadeOut(400, function(){
        var courseCode = $('td:nth-child(3)', tr).text();
        global_student.removeCourse(courseCode);
        notify("<em>Remove (Course):</em> " + courseCode);
        tr.remove();
    
        drawCoursesTable();
        updateFinalDetails();
    });
    
    return false;
});

$('#student_courses_table').on('click', '.edit_row_button', function() {
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
    
    drawCoursesTable();
    updateFinalDetails();
});

$('#student_courses_table').on('click', '.overall_gpa_checkbox', function() {
    var tr = $(this).closest('tr');
    var courseCode = $('td:nth-child(3)', tr).text();
    var include = $(this)[0].checked;
    global_student.setIncludeInOverallGpa(courseCode, include);
    
    // workaround to prevent scrolling
    // get current pos
    var currPos = $(document).scrollTop();
    
    drawCoursesTable();
    updateFinalDetails();
    
    // set to previous position after table drawing
    $(document).scrollTop(currPos);
    
    return false;
});

$('#student_courses_table').on('click', '.subject_gpa_checkbox', function() {
    var tr = $(this).closest('tr');
    var courseCode = $('td:nth-child(3)', tr).text();
    var subjCode = $(this).val();
    var includeSubject = $(this)[0].checked;
    global_student.setIncludeInSubjectGpa(courseCode, subjCode, includeSubject);
    
    // workaround to prevent scrolling
    // get current pos
    var currPos = $(document).scrollTop();
    
    drawCoursesTable();
    updateFinalDetails();
    
    // set to previous position after table drawing
    $(document).scrollTop(currPos);
    
    return false;
});

function drawSubjectsTable() {
    $('#student_subjects_table > tbody').empty();
    
    var rows = '';
    for (var i = 0, n = global_student.subjects.length; i < n; ++i) {
        var subj = global_student.subjects[i];
        rows += '<tr><td><button class="pure-button delete_row_button">X</button></td>' +
                 '<td>' + subj.subject + '</td><td>' + subj.code + '</td></tr>';
    }
    $('#student_subjects_table').append('<tbody>' + rows + '</tbody>');
}

function drawCoursesTable() {
    $('#student_courses_table').empty();
    
    var nSubjects = global_student.subjects.length;
    
    // headings
    var thead = '<thead><th></th><th>Semester</th><th>Code</th><th>Title</th><th>Credits</th><th>Grade</th><th>Overall GPA</th>';
    // hedings for subjects
    for (i = 0; i < nSubjects; ++i) {
        thead += '<th>' + global_student.subjects[i].code + '</th>'
    }
    thead += '</thead>';
    $('#student_courses_table').append(thead);
    
    // tbody for each year
    for (var year = 1; year <= 4; ++year) { // year loop start
        var rows = '';
        
        for (var i = 0, n = global_student.enrolledCourses.length; i < n; ++i) { // course loop start
            var eC = global_student.enrolledCourses[i];
            
            if (eC.year != year) 
                continue;

            rows += '<tr><td><button class="pure-button edit_row_button">E</button><button class="pure-button delete_row_button">X</button></td>' +
                    '<td>' + eC.semester + '</td>' +  '<td>' + eC.course.code + '</td>' +  
                    '<td>' + eC.course.title + (eC.repeat ? ' (R)' : '') + '</td>' + 
                    '<td>' + eC.course.credits + '</td>' +  '<td>' + eC.grade + '</td>' + 
                    '<td><input class="overall_gpa_checkbox" type="checkbox" value="overall_gpa" ' +
                    ((eC.include_in_overall_gpa) ? 'checked' : '') + '></td>';
            
            // check boxes for subjects
            var disabled = !eC.include_in_overall_gpa ? 'disabled' : '';
            for (j = 0; j < nSubjects; ++j) {
                var subjectCode = global_student.subjects[j].code;
                var checked = (eC.include_in_overall_gpa && (eC.include_in_subject_gpa.indexOf(subjectCode) > -1)) ? 'checked' : '';
                
                rows += '<td><input class="subject_gpa_checkbox" type="checkbox" value="' +subjectCode + '" ' + 
                        checked + ' ' + disabled +'></td>';
            }
            
            rows += '</tr>';
        } // course loop end
        
        if (rows == '')
            continue;
        
        // year credits & GPAs
        rows += '<tr><td colspan=4></td>' +
                '<td>' + global_gpa.totalCreditsOfYearInGpa(year) + ' / ' + global_gpa.totalCreditsOfYear(year) + 
                '</td><td></td>' + 
                '<td>' + global_gpa.overallGpaOfYear(year) + '</td>';
        // year gpas of subjects
        for (j = 0; j < nSubjects; ++j) {
            var subjectCode = global_student.subjects[j].code;
            rows += '<td>' + global_gpa.subjectGpaOfYear(year, subjectCode) + 
                    ' | ' + global_gpa.totalSubjectCreditsOfYearInGpa(year, subjectCode) + '</td>';
        }
        rows += '</tr>';
        
        var tbody = '<tbody><tr><td colspan=' + (7 + nSubjects) + '>Year ' + year + '</td></tr>' + rows + '</tbody>'
        $('#student_courses_table').append(tbody);
    } // year loop end
}

function updateFinalDetails() {
    // subject gpas
    $('#subject_gpas').empty();
    var str, subjectCode;
    for (var i = 0, n = global_student.subjects.length; i < n; ++i) {
        subjectCode = global_student.subjects[i].code;
        str = '<p>' + subjectCode + ': ' + global_gpa.subjectGpa(subjectCode) + '</p>';
        $('#subject_gpas').append(str);
    }
    
    // overall gpas
    $('#overall_gpa').text(global_gpa.overallGpa());
    
    // credits
    $('#n_credits_in_gpa').text(global_gpa.totalCreditsInGpa());
    $('#n_credits').text(global_gpa.totalCredits());
}
