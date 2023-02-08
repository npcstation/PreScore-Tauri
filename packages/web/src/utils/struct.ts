export class Exam {
  examCreateDateTime: number;
  examId: string;
  examName: string;
  examType: string;
  final: boolean;
  hasExamReport: boolean;
  homeWork: boolean;
  isFinal: boolean;
  newType: boolean;
  score: number;
  showExportOfflineReport: boolean;
  showHomeWorkAnalysis: boolean;
  sign: boolean;
  standardTotalScore: number;
  threeOrX: boolean;

  constructor(
    examCreateDateTime: number,
    examId: string,
    examName: string,
    examType: string,
    final: boolean,
    hasExamReport: boolean,
    homeWork: boolean,
    isFinal: boolean,
    newType: boolean,
    score: number,
    showExportOfflineReport: boolean,
    showHomeWorkAnalysis: boolean,
    sign: boolean,
    standardTotalScore: number,
    threeOrX: boolean
  ) {
    this.examCreateDateTime = examCreateDateTime;
    this.examId = examId;
    this.examName = examName;
    this.examType = examType;
    this.final = final;
    this.hasExamReport = hasExamReport;
    this.homeWork = homeWork;
    this.isFinal = isFinal;
    this.newType = newType;
    this.score = score;
    this.showExportOfflineReport = showExportOfflineReport;
    this.showHomeWorkAnalysis = showHomeWorkAnalysis;
    this.sign = sign;
    this.standardTotalScore = standardTotalScore;
    this.threeOrX = threeOrX;
  }
}

export class Paper {
  assignStandardScore: number;
  beSubSubject: boolean;
  beVipExp: boolean;
  hasAssignScore: boolean;
  hasLevel: boolean;
  isSinglePublish: boolean;
  paperId: string;
  paperName: string;
  preAssignScore: number;
  scoringModel: number;
  standardScore: number;
  subjectCode: string;
  subjectName: string;
  title: string;
  userLevel: string;
  userScore: number;
  subjectLabels: any;
  tags: any;

  constructor(
    assignStandardScore: number,
    beSubSubject: boolean,
    beVipExp: boolean,
    hasAssignScore: boolean,
    hasLevel: boolean,
    isSinglePublish: boolean,
    paperId: string,
    paperName: string,
    preAssignScore: number,
    scoringModel: number,
    standardScore: number,
    subjectCode: string,
    subjectName: string,
    title: string,
    userLevel: string,
    userScore: number,
    subjectLabels: any,
    tags: any
  ) {
    this.assignStandardScore = assignStandardScore;
    this.beSubSubject = beSubSubject;
    this.beVipExp = beVipExp;
    this.hasAssignScore = hasAssignScore;
    this.hasLevel = hasLevel;
    this.isSinglePublish = isSinglePublish;
    this.paperId = paperId;
    this.paperName = paperName;
    this.preAssignScore = preAssignScore;
    this.scoringModel = scoringModel;
    this.standardScore = standardScore;
    this.subjectCode = subjectCode;
    this.subjectName = subjectName;
    this.title = title;
    this.userLevel = userLevel;
    this.userScore = userScore;
    this.subjectLabels = subjectLabels;
    this.tags = tags;
  }
}

export class Diagnosis {
  avgRank: number;
  myRank: number;
  rationalRank: number;
  showGradeSecondary: boolean;
  subjectCode: string;
  subjectName: string;

  constructor(
    avgRank: number,
    myRank: number,
    rationalRank: number,
    showGradeSecondary: boolean,
    subjectCode: string,
    subjectName: string
  ) {
    this.avgRank = avgRank;
    this.myRank = myRank;
    this.rationalRank = rationalRank;
    this.showGradeSecondary = showGradeSecondary;
    this.subjectCode = subjectCode;
    this.subjectName = subjectName;
  }
}
