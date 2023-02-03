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
