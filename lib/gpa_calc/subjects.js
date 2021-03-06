var global_subjects = [
  {
    subject: "Applied Sciences",
    code: "AS"
  },
  {
    subject: "Biology",
    code: "BL"
  },
  {
    subject: "Botany",
    code: "BT"
  },
  {
    subject: "Chemistry",
    code: "CH"
  },
  {
    subject: "Computation and Management",
    code: "CM"
  },
  {
    subject: "Computer Science",
    code: "CS"
  },
  {
    subject: "English",
    code: "EN"
  },
  {
    subject: "Geology",
    code: "GL"
  },
  {
    subject: "Mathematics",
    code: "MT"
  },
  {
    subject: "Molecular Biology and Biotechnology",
    code: "MB"
  },
  {
    subject: "Physics",
    code: "PH"
  },
  {
    subject: "Statistics & Operations Research",
    code: "SOR"
  },
  {
    subject: "Statistics",
    code: "ST"
  },
  {
    subject: "Zoology",
    code: "ZL"
  },
  {
    subject: "Economics",
    code: "EC"
  },
  {
    subject: "Management Studies",
    code: "MG"
  },
  {
    subject: "Science Education",
    code: "SE"
  }
];

global_subjects.sort(function (a, b) {
    if (a.subject < b.subject)
        return -1;
    if (a.subject > b.subject)
        return 1;
    return 0;
});