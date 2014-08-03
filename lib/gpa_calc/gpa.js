function Gpa(student) {
    this.student = student;
}

Gpa.prototype.totalSubjectCreditsOfYearInGpa = function (year, subjectCode) {
    var totalCredits = 0;

    for (var i = 0, n = this.student.enrolledCourses.length; i < n; ++i) {
        var eC = this.student.enrolledCourses[i];

        if (eC.year != year || !eC.include_in_overall_gpa || eC.include_in_subject_gpa.indexOf(subjectCode) === -1)
            continue;

        totalCredits += eC.course.credits;
    }

    return totalCredits;
}

Gpa.prototype.totalSubjectCreditsInGpa = function (subjectCode) {
    var totalCredits = 0;

    for (var i = 0, n = this.student.enrolledCourses.length; i < n; ++i) {
        var eC = this.student.enrolledCourses[i];

        if (!eC.include_in_overall_gpa || eC.include_in_subject_gpa.indexOf(subjectCode) === -1)
            continue;

        totalCredits += eC.course.credits;
    }

    return totalCredits;
}

Gpa.prototype.totalCreditsOfYear = function (year) {
    var totalCredits = 0;

    for (var i = 0, n = this.student.enrolledCourses.length; i < n; ++i) {
        var eC = this.student.enrolledCourses[i];

        if (eC.year === year) {
            totalCredits += eC.course.credits;
        }
    }

    return totalCredits;
}

Gpa.prototype.totalCredits = function () {
    var totalCredits = 0;

    for (var i = 0, n = this.student.enrolledCourses.length; i < n; ++i) {
        totalCredits += this.student.enrolledCourses[i].course.credits;
    }

    return totalCredits;
}

Gpa.prototype.totalCreditsOfYearInGpa = function(year) {
    var totalCredits = 0;

    for (var i = 0, n = this.student.enrolledCourses.length; i < n; ++i) {
        var eC = this.student.enrolledCourses[i];

        if (eC.year === year && eC.include_in_overall_gpa) {
            totalCredits += eC.course.credits;
        }
    }

    return totalCredits;
}

Gpa.prototype.totalCreditsInGpa = function() {
    var totalCredits = 0;

    for (var i = 0, n = this.student.enrolledCourses.length; i < n; ++i) {
        var eC = this.student.enrolledCourses[i];

        if (eC.include_in_overall_gpa) {
            totalCredits += eC.course.credits;
        }
    }

    return totalCredits;
}

Gpa.prototype.subjectGpaOfYear = function(year, subjectCode) {
    var sumCredits = 0;
    var sumCreditsIntoGradePoints = 0.0;
    
    for (var i = 0, n = this.student.enrolledCourses.length; i < n; ++i) {
        var eC = this.student.enrolledCourses[i];
        if (eC.year != year || !eC.include_in_overall_gpa || eC.include_in_subject_gpa.indexOf(subjectCode) === -1)
            continue;
        
        sumCredits += eC.course.credits;
        sumCreditsIntoGradePoints += eC.course.credits * gradePointOf(eC.grade);
    }
    
    var gpa = precise_round(0, 2);
    if (sumCredits > 0)
        gpa = precise_round(sumCreditsIntoGradePoints / sumCredits, 2)
    
    return gpa;
}

Gpa.prototype.subjectGpa = function(subjectCode) {
    var sumCredits = 0;
    var sumCreditsIntoGradePoints = 0.0;
    
    for (var i = 0, n = this.student.enrolledCourses.length; i < n; ++i) {
        var eC = this.student.enrolledCourses[i];
        if (!eC.include_in_overall_gpa || eC.include_in_subject_gpa.indexOf(subjectCode) === -1)
            continue;
        
        sumCredits += eC.course.credits;
        sumCreditsIntoGradePoints += eC.course.credits * gradePointOf(eC.grade);
    }
    
    var gpa = precise_round(0, 2);
    if (sumCredits > 0)
        gpa = precise_round(sumCreditsIntoGradePoints / sumCredits, 2)
    
    return gpa;
}

Gpa.prototype.overallGpaOfYear = function(year) {
    var sumCredits = 0;
    var sumCreditsIntoGradePoints = 0.0;
    
    for (var i = 0, n = this.student.enrolledCourses.length; i < n; ++i) {
        var eC = this.student.enrolledCourses[i];
        if (eC.year != year || !eC.include_in_overall_gpa)
            continue;
        
        sumCredits += eC.course.credits;
        sumCreditsIntoGradePoints += eC.course.credits * gradePointOf(eC.grade);
    }
    
    var gpa = precise_round(0, 2);
    if (sumCredits > 0)
        gpa = precise_round(sumCreditsIntoGradePoints / sumCredits, 2)
    
    return gpa;
}

Gpa.prototype.overallGpa = function() {
    var sumCredits = 0;
    var sumCreditsIntoGradePoints = 0.0;
    
    for (var i = 0, n = this.student.enrolledCourses.length; i < n; ++i) {
        var eC = this.student.enrolledCourses[i];
        if (!eC.include_in_overall_gpa)
            continue;
        
        sumCredits += eC.course.credits;
        sumCreditsIntoGradePoints += eC.course.credits * gradePointOf(eC.grade);
    }
    
    var gpa = precise_round(0, 2);
    if (sumCredits > 0)
        gpa = precise_round(sumCreditsIntoGradePoints / sumCredits, 2)
    
    return gpa;
}
