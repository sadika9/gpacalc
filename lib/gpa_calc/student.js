function Student() {
    this.subjects = [];
    this.enrolledCourses = [];
}

Student.prototype.addSubject = function(subjectCode, subject) {
    // check for duplicates
    for (var i = 0, n = this.subjects.length; i < n; ++i) {
        if (this.subjects[i].code === subjectCode)
            return; // not inserted
    }
    
    // no duplicates, push
    this.subjects.push(new Subject(subjectCode, subject));
    
    // sort array
    this.subjects.sort(function (a, b) {
        if (a.subject < b.subject)
            return -1;
        if (a.subject > b.subject)
            return 1;
        return 0;
    });
}
   
Student.prototype.removeSubject = function(subjectCode) {
    var index = -1;
    for (var i = 0, n = this.subjects.length; i < n; ++i) {
        if (this.subjects[i].code === subjectCode) {
            index = i;
            break;
        }
    }
    
    if (index > -1) {
        this.subjects.splice(index, 1);
    }
}

Student.prototype.isEnrolled = function(courseCode, year) {
    for (var i = 0, n = this.enrolledCourses.length; i < n; ++i) {
        if (this.enrolledCourses[i].year === year) {
            if (this.enrolledCourses[i].course.code === courseCode)
                return true;
        }
    }
    
    return false;
}

Student.prototype.addCourse = function(year, semester, course, repeat, grade, include_in_overall_gpa) {
    var include_in_subject_gpa = [];
    
    for (var i = 0, nS = this.subjects.length; i < nS; ++i) {
        for (var j = 0, nC = course.principal_subject_area.length; j < nC; ++j) {
            if (course.principal_subject_area[j] === this.subjects[i].code)
                include_in_subject_gpa.push(this.subjects[i].code);
        }
    }
    
    var e = new EnrolledCourse(year, semester, course, repeat, grade, include_in_overall_gpa, include_in_subject_gpa);
    
    this.enrolledCourses.push(e);

    this.enrolledCourses.sort(function (a, b) {
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
}
   
Student.prototype.removeCourse = function(courseCode) {
    var index = -1;
    for (var i = 0, n = this.enrolledCourses.length; i < n; ++i) {
        if (this.enrolledCourses[i].course.code === courseCode) {
            index = i;
            break;
        }
    }
    
    if (index > -1) {
        this.enrolledCourses.splice(index, 1);
    }
}

Student.prototype.getCourseRef = function(courseCode) {
    for (var i = 0, n = this.enrolledCourses.length; i < n; ++i) {
        if (this.enrolledCourses[i].course.code === courseCode) {
            return this.enrolledCourses[i];
        }
    }
}