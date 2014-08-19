var global_student = new Student();
var global_gpa = new Gpa(global_student);
var global_io = new IO(global_student);

function notify(message, style){
    // available styles: "success", "info", "warn", "error"
    $.notify(message, { className: style, globalPosition: 'bottom right' });
}

$(document).ready(function() { 
    $.each(global_subjects, function(i, el) {
        $('#subjects_combo_in_add_subjects').append(new Option(el.subject, el.code));
        $('#subjects_combo_in_add_course').append(new Option(el.subject, el.code));
    });
    
    $.each(global_grades, function(i, el) {
        $('#grades_combo_in_add_course').append(new Option(el.grade, el.grade));
        $('#edit_course_modal_grade').append(new Option(el.grade, el.grade));
    });
});

$('#open_button').click(function() {
    $('#file_input').click();
});

$('#file_input').change(function() {
    global_io.open(this.files[0]);
    notify('Success: File Open', 'success');
});

$('#save_button').click(function() {
    global_io.save();
    notify('Success: File Save', 'success');
});

$('#add_subject_button').click(function() {
    var e = $('#subjects_combo_in_add_subjects option:selected');
    global_student.addSubject(e.val(), e.text());

    drawSubjectsTable();
    drawCoursesTable();
    updateFinalDetails();

    notify('Add subject: ' + e.text(), 'info');
});

$('#student_subjects_table').on('click', '.delete_row_button', function() {
    var tr = $(this).closest('tr');
    tr.css('background-color','#CA3C3C');
    tr.fadeOut(400, function(){
        global_student.removeSubject($('td:nth-child(2)', tr).text());
        notify('Remove subject: ' + $('td:nth-child(1)', tr).text(), 'info');
        
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
    else if (subjectCode === "CM")  {
        $.each(global_courses, function(i, el) {
            if (el.principal_subject_area.indexOf(subjectCode) > -1)
                $('#course_combo_in_add_course').append(new Option(el.code + " - " + el.title, el.code));
        });
    }
    else if (subjectCode === "SOR")  {
        $.each(global_courses, function(i, el) {
            if (el.principal_subject_area.indexOf(subjectCode) > -1)
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
    
    notify('Add course: ' + course.code + ' - ' + course.title, 'info');
});

$('#student_courses_table').on('click', '.delete_row_button', function() {
    var tr = $(this).closest('tr');
    tr.css('background-color','#CA3C3C');
    tr.fadeOut(400, function(){
        var year = Number($('td:nth-child(1)', tr).text());
        var courseCode = $('td:nth-child(3)', tr).text();
        global_student.removeCourse(year, courseCode);
        notify('Remove course: ' + courseCode, 'info'); 
        tr.remove();
    
        drawCoursesTable();
        updateFinalDetails();
    });
    
    return false;
});

$('#student_courses_table').on('click', '.edit_row_button', function() {
    var tr = $(this).closest('tr');
    var year = Number($('td:nth-child(1)', tr).text());
    var courseCode = $('td:nth-child(3)', tr).text();
    var eC = global_student.getCourseRef(year, courseCode);

    $('#edit_course_modal_label').text(eC.course.code + " - " + eC.course.title);
    $('#edit_course_modal_course_code').text(eC.course.code);
    $('#edit_course_modal_year').text(eC.year);
    $('#edit_course_modal_credits').val(eC.course.credits);
    $('#edit_course_modal_semester').val(eC.semester);
    $('#edit_course_modal_grade').val(eC.grade);
    $('#edit_course_modal_repeat')[0].checked = eC.repeat;

    $('#edit_course_modal').modal('show');
    
    return false;
});

$('#edit_course_modal_save_button').click(function(){
    var year = Number($('#edit_course_modal_year').text());
    var courseCode = $('#edit_course_modal_course_code').text();
    var eC = global_student.getCourseRef(year, courseCode);

    eC.semester = $('#edit_course_modal_semester').val();
    eC.course.credits = Number($('#edit_course_modal_credits').val());
    eC.grade = $('#edit_course_modal_grade').val();
    eC.repeat = $('#edit_course_modal_repeat')[0].checked;
    
    global_student.sortEnrolledCourses();
    
    notify('Update course: ' +  $('#edit_course_modal_label').text(), 'info');
    
    drawCoursesTable();
    updateFinalDetails();
    
    $('#edit_course_modal').modal('hide');
});

$('#student_courses_table').on('click', '.overall_gpa_checkbox', function() {
    var tr = $(this).closest('tr');
    var year = Number($('td:nth-child(1)', tr).text());
    var courseCode = $('td:nth-child(3)', tr).text();
    var include = $(this)[0].checked;
    global_student.setIncludeInOverallGpa(year, courseCode, include);
    
    // workaround to prevent scrolling
    // get current pos
    var currPos = $(document).scrollTop();
    
    drawCoursesTable();
    updateFinalDetails();
    
    // set to previous position after table drawing
    $(document).scrollTop(currPos);
    
    notify((include ? 'Include ' + courseCode + ' in overall GPA' : 'Exclude ' + courseCode + ' from overall GPA') , 'info');
    
    return false;
});

$('#student_courses_table').on('click', '.subject_gpa_checkbox', function() {
    var tr = $(this).closest('tr');
    var year = Number($('td:nth-child(1)', tr).text());
    var courseCode = $('td:nth-child(3)', tr).text();
    var subjCode = $(this).val();
    var includeSubject = $(this)[0].checked;
    global_student.setIncludeInSubjectGpa(year, courseCode, subjCode, includeSubject);
    
    // workaround to prevent scrolling
    // get current pos
    var currPos = $(document).scrollTop();
    
    drawCoursesTable();
    updateFinalDetails();
    
    // set to previous position after table drawing
    $(document).scrollTop(currPos);
    
    var msg;
    if (includeSubject)
        msg = 'Include ' + courseCode + ' in ' + subjCode + ' GPA';
    else 
        msg = 'Exclude ' + courseCode + ' from ' + subjCode + ' GPA';
    notify(msg , 'info');
    
    return false;
});

function drawSubjectsTable() {
    $('#student_subjects_table').empty();
    
    var rows = '';
    for (var i = 0, n = global_student.subjects.length; i < n; ++i) {
        var subj = global_student.subjects[i];
        rows += '<tr><td>' + subj.subject + '</td><td>' + subj.code + '</td>' +
                '<td><button class="btn btn-danger btn-xs delete_row_button"><span class="glyphicon glyphicon-remove"></span></button></td></tr>';
    }
    
    if (rows == '')
        return;
    
    $('#student_subjects_table').append('<thead><th>Subject</th><th>Code</th><th></th></thead>');
    $('#student_subjects_table').append('<tbody>' + rows + '</tbody>');
}

function drawCoursesTable() {
    $('#student_courses_table').floatThead('destroy');
    $('#student_courses_table').empty();
    
    var nSubjects = global_student.subjects.length;
     
    // tbody for each year
    for (var year = 1; year <= 4; ++year) { // year loop start
        var rows = '';
        
        for (var i = 0, n = global_student.enrolledCourses.length; i < n; ++i) { // course loop start
            var eC = global_student.enrolledCourses[i];
            
            if (eC.year != year) 
                continue;

            rows += '<tr><td class="text-center">' + eC.year + '</td>' +  '<td class="text-center">' + eC.semester + '</td>' +  '<td>' + eC.course.code + '</td>' +  
                    '<td>' + eC.course.title + (eC.repeat ? ' (R)' : '') + '</td>' + 
                    '<td class="text-center">' + eC.course.credits + '</td>' +  '<td>' + eC.grade + '</td>' + 
                    '<td class="text-center"><input class="overall_gpa_checkbox" type="checkbox" value="overall_gpa" ' +
                    ((eC.include_in_overall_gpa) ? 'checked' : '') + '></td>';
            
            // check boxes for subjects
            var disabled = !eC.include_in_overall_gpa ? 'disabled' : '';
            for (j = 0; j < nSubjects; ++j) {
                var subjectCode = global_student.subjects[j].code;
                var checked = (eC.include_in_overall_gpa && (eC.include_in_subject_gpa.indexOf(subjectCode) > -1)) ? 'checked' : '';
                
                rows += '<td class="text-center"><input class="subject_gpa_checkbox" type="checkbox" value="' + subjectCode + '" ' + 
                        checked + ' ' + disabled +'></td>';
            }
            
            rows += '<td><button class="btn btn-primary btn-xs edit_row_button"><span class="glyphicon glyphicon-edit"></span></button> ' +
                    '<button class="btn btn-danger btn-xs delete_row_button"><span class="glyphicon glyphicon-remove"></span></button></td></tr>';
        } // course loop end
        
        if (rows == '')
            continue;
        
        // year credits & GPAs
        rows += '<tr class="summary_row"><td colspan=4></td>' +
                '<td class="text-center">' + global_gpa.totalCreditsOfYear(year) + '</td><td></td>' + 
                '<td>' + global_gpa.overallGpaOfYear(year) + ' | ' + global_gpa.totalCreditsOfYearInGpa(year) + '</td>';
        // year gpas of subjects
        for (j = 0; j < nSubjects; ++j) {
            var subjectCode = global_student.subjects[j].code;
            rows += '<td>' + global_gpa.subjectGpaOfYear(year, subjectCode) + 
                    ' | ' + global_gpa.totalSubjectCreditsOfYearInGpa(year, subjectCode) + '</td>';
        }
        rows += '<td></td></tr>';
        
        var tbody = '<tbody>' + rows + '</tbody>'
        $('#student_courses_table').append(tbody);
    } // year loop end
    
    
    // appending head only if table is not emptry
    if ($("#student_courses_table > tbody > tr").length === 0)
        return;
    
    // headings
    var thead = '<thead><th>Year</th><th>Semester</th><th>Code</th><th>Title</th><th>Credits</th><th>Grade</th><th>Overall GPA</th>';
    // hedings for subjects
    for (i = 0; i < nSubjects; ++i) {
        thead += '<th>' + global_student.subjects[i].code + '</th>'
    }
    thead += '<th></th></thead>';
    $('#student_courses_table').append(thead);
    
    $('#student_courses_table').floatThead({
        scrollingTop: 50
    });
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
