/****************** Saving and loading student data ******************/

function saveStudentData() {
    var data = {
        name: "GPA Calc",
        version: 1,
        studentSubjects: global_student.subjects,
        studentCourses: global_student.enrolledCourses
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
            global_student.subjects = data.studentSubjects;
            global_student.enrolledCourses = data.studentCourses;

            drawSubjectsTable();
            drawCoursesTable();
            updateFinalDetails();
        }
    })(file);

    reader.readAsText(file);
}
 