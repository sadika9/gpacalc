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
 