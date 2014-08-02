var global_grades = [
  {
    grade: "A+",
    grade_point: 4
  },
  {
    grade: "A",
    grade_point: 4
  },
  {
    grade: "A-",
    grade_point: 3.7
  },
  {
    grade: "B+",
    grade_point: 3.3
  },
  {
    grade: "B",
    grade_point: 3
  },
  {
    grade: "B-",
    grade_point: 2.7
  },
  {
    grade: "C+",
    grade_point: 2.3
  },
  {
    grade: "C",
    grade_point: 2
  },
  {
    grade: "C-",
    grade_point: 1.7
  },
  {
    grade: "D+",
    grade_point: 1.3
  },
  {
    grade: "D",
    grade_point: 1
  },
  {
    grade: "F",
    grade_point: 0
  }
];

function gradePointOf(grade) {
    for (var i = 0, nGrades = global_grades.length; i < nGrades; ++i) {
        if (global_grades[i].grade === grade) {
            return global_grades[i].grade_point;
        }
    }
    return 0;
}