function Course(code, title, credits, prerequisites, equivalent, exclude_from_gpa, compulsory_for_degree, principal_subject_area) {
    this.code = code;
    this.title = title;
    this.credits = credits;
    this.prerequisites = prerequisites;
    this.equivalent = equivalent;
    this.exclude_from_gpa = exclude_from_gpa;
    this.compulsory_for_degree = compulsory_for_degree;
    this.principal_subject_area = principal_subject_area;
}

Course.prototype.clone = function() {
    var c = new Course(this.code, this.title, this.credits, [], [], this.exclude_from_gpa, [], []);
    
    for (var i = 0, n = this.prerequisites.length; i < n; ++i) {
        c.prerequisites.push(this.prerequisites[i]);
    }
    for (var i = 0, n = this.equivalent.length; i < n; ++i) {
        c.equivalent.push(this.equivalent[i]);
    }
    for (var i = 0, n = this.compulsory_for_degree.length; i < n; ++i) {
        c.compulsory_for_degree.push(this.compulsory_for_degree[i]);
    }
    for (var i = 0, n = this.principal_subject_area.length; i < n; ++i) {
        c.principal_subject_area.push(this.principal_subject_area[i]);
    }
    
    return c;
}

Course.prototype.addPrerequisites = function(prerequisites) {
    for (var i = 0, n = prerequisites.length; i < n; ++i) {
        this.prerequisites.push(prerequisites[i]);
    }
}

function courseFromGlobalCourse(course) {
    var c = new Course(course.code, course.title, course.credits, [], [], course.exclude_from_gpa, [], []);
    
    for (var i = 0, n = course.prerequisites.length; i < n; ++i) {
        c.prerequisites.push(course.prerequisites[i]);
    }
    for (var i = 0, n = course.equivalent.length; i < n; ++i) {
        c.equivalent.push(course.equivalent[i]);
    }
    for (var i = 0, n = course.compulsory_for_degree.length; i < n; ++i) {
        c.compulsory_for_degree.push(course.compulsory_for_degree[i]);
    }
    for (var i = 0, n = course.principal_subject_area.length; i < n; ++i) {
        c.principal_subject_area.push(course.principal_subject_area[i]);
    }
    
    return c;
}
