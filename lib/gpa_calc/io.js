function IO(studentRef) {
    this.student = studentRef;
}

IO.prototype.save =  function() {
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

// TODO: use Student objects provided methods to load data, current method is not reliable
IO.prototype.open = function(file) {
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
 