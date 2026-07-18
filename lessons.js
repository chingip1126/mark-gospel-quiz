/*
  題庫只需在此檔案修改。
  新增一課：複製 lessonTemplate.js 的範本，貼到 lessons 陣列。
  correctIndex 從 0 開始：A=0、B=1、C=2、D=3。
*/

export const lessons = [
  {
    id: "mark-01",
    number: 1,
    published: true,
    title: "好消息，正式啟動",
    subtitle: "耶穌傳道前的預備",
    passage: "馬可福音 1:1–13",
    rewardThreshold: 0.8,
    questions: [
      {
        id: "m01-q01",
        reference: "馬可福音 1:1",
        text: "馬可福音一開始稱耶穌為甚麼？",
        options: ["偉大的教師", "神的兒子、基督", "加利利的先知", "施洗約翰的學生"],
        correctIndex: 1,
        explanation: "馬可一開始便宣告耶穌是基督、神的兒子；福音的中心是耶穌本人。"
      },
      {
        id: "m01-q02",
        reference: "馬可福音 1:1",
        text: "「福音」最基本的意思是：",
        options: ["宗教規則", "好消息", "神秘預言", "做好人的方法"],
        correctIndex: 1,
        explanation: "「福音」就是好消息，指神藉耶穌基督帶來的拯救。"
      },
      {
        id: "m01-q03",
        reference: "馬可福音 1:4",
        text: "施洗約翰主要在哪裏傳道？",
        options: ["皇宮", "聖殿", "曠野", "學校"],
        correctIndex: 2,
        explanation: "約翰在曠野傳道，成為預備主道路的聲音。"
      },
      {
        id: "m01-q04",
        reference: "馬可福音 1:4",
        text: "約翰呼籲人接受甚麼洗禮？",
        options: ["成功的洗禮", "悔改的洗禮", "成年禮洗禮", "加入教會的洗禮"],
        correctIndex: 1,
        explanation: "約翰傳講悔改的洗禮，呼召人承認罪、轉向神，預備迎接耶穌。"
      },
      {
        id: "m01-q05",
        reference: "馬可福音 1:4–5",
        text: "真正的悔改包含甚麼？",
        options: ["講「對唔住」", "停止錯誤行為及改過", "重新轉向神", "以上皆是"],
        correctIndex: 3,
        explanation: "真正悔改不只是一句道歉，也包括承認錯誤、離開原有方向並重新轉向神。"
      },
      {
        id: "m01-q06",
        reference: "馬可福音 1:8",
        text: "施洗約翰說，後來的那一位會用甚麼施洗？",
        options: ["海水", "火", "聖靈", "香油"],
        correctIndex: 2,
        explanation: "約翰用水施洗；耶穌卻要用聖靈施洗，帶來真正的生命更新。"
      },
      {
        id: "m01-q07",
        reference: "馬可福音 1:9",
        text: "耶穌從哪裏來到約旦河受洗？",
        options: ["伯利恆", "耶路撒冷", "加利利的拿撒勒", "羅馬"],
        correctIndex: 2,
        explanation: "耶穌從加利利的拿撒勒來，在約旦河接受約翰的洗禮。"
      },
      {
        id: "m01-q08",
        reference: "馬可福音 1:11",
        text: "耶穌受洗後，天上的聲音說甚麼？",
        options: ["你要努力證明自己", "你是我的愛子，我喜悅你", "你要成為以色列的王", "你已經完成使命"],
        correctIndex: 1,
        explanation: "天父公開確認耶穌是祂的愛子，並表明祂喜悅耶穌。"
      },
      {
        id: "m01-q09",
        reference: "馬可福音 1:13",
        text: "耶穌在曠野多久？",
        options: ["7日", "12日", "30日", "40日"],
        correctIndex: 3,
        explanation: "耶穌在曠野四十日受撒但試探，卻沒有向試探屈服。"
      },
      {
        id: "m01-q10",
        reference: "馬可福音 1:13",
        text: "馬可記載耶穌在曠野時，有誰服侍祂？",
        options: ["門徒", "天使", "祭司", "群眾"],
        correctIndex: 1,
        explanation: "經文記載耶穌與野獸同在一處，並有天使來服侍祂。"
      }
    ]
  }
];

export function getLesson(id) {
  return lessons.find((lesson) => lesson.id === id && lesson.published);
}

export function getPublishedLessons() {
  return lessons.filter((lesson) => lesson.published);
}
