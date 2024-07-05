# TJ 코인 노래방 노래 검색 API

![demo1](https://github.com/Alfex4936/tj-media-karaoke-api/assets/2356749/aae6a958-fa3c-435c-be34-909d026255cb)

![demo2](https://github.com/Alfex4936/tj-media-karaoke-api/assets/2356749/3d8e7b67-7dcd-47d6-9d69-5ec0a44eeac6)

이 프로젝트는 코인 노래방 데이터베이스에서 노래를 검색할 수 있는 간단하고 효율적인 API입니다.

API를 통해 코인 노래방에 가기 전에 쉽게 노래를 찾을 수 있습니다.

> 미리 모든 곡들을 다운로드해서, tj미디어의 검색 기능을 사용하지 않습니다. (직접 구현)

## TODO

- [ ] 팝송 국가 세분화 하기
  - [x] FR (프랑스) 곡 구분
  - [x] SPA (스페인) 곡 구분
  - [x] ITA (이탈리아) 곡 구분
  - [x] PRT (포르투갈) 곡 구분
  - [x] PHL (필리핀) 곡 구분
  - [x] ROU (루마니아) 곡 구분
  - [x] GER (독일) 곡 구분
- [x] 검색 인덱싱 직접하기 ([Go Bleve](https://github.com/blevesearch/bleve/) [Apache Lucene like])
  - [x] 한글 초성 검색
  - [x] 영어 초성 검색 ("I Want you" -> "iwy")
  - [x] 일본어 로마자 변환 ("相思相愛" -> "Sousi souai", powered by [cutlet](https://github.com/polm/cutlet))
  - [x] TJ 곡 DB 생성 (정확하지 않을 수도 있음, 2024년 7월까지 기준)
  - [x] 국가별 곡 검색 구분
  - [x] 작사/작곡가 검색
- [ ] 서버 구현
  - [ ] API 셋업
  - [ ] DB 셋업
  - [ ] ...

## bleve 예제

```bash

2024/06/30 20:26:54 고유비에 대한 검색을 시작합니다...
2024/06/30 20:26:54 💖 8곡 찾음

2024/06/30 20:26:54 1번: 30285: 사랑한다말하면 - 고유비 | Lyricist: MR.고철 | Composer: MR.고철
2024/06/30 20:26:54 2번: 12365: 루 - 고유비 | Lyricist: 김혜선 | Composer: 신훈철
2024/06/30 20:26:54 3번: 93980: 꼭기억해 - 고유비 | Lyricist: MR.고철 | Composer: MR.고철
2024/06/30 20:26:54 4번: 18351: 그대만 보이네요 - 고유비 | Lyricist: MR.고철 | Composer: MR.고철
2024/06/30 20:26:54 5번: 14960: Last Love - 고유비 | Lyricist: MR.고철 | Composer: MR.고철
2024/06/30 20:26:54 6번: 16424: 험한세상의다리되어 - 고유비 | Lyricist: MR.고철 | Composer: MR.고철,전영
2024/06/30 20:26:54 7번: 12372: 사랑은한번뿐이야 - 고유비 | Lyricist: 조안나 | Composer: 유해 준
2024/06/30 20:26:54 8번: 16761: 결혼 - 고유비 | Lyricist: MR.고철 | Composer: MR.고철
2024/06/30 20:26:54 Function runtime: 48.7071ms

################################
2024/06/30 20:52:38 "불타"에 대한 검색을 시작합니다...
2024/06/30 20:52:38 💖 15곡 찾음

2024/06/30 20:52:38 Full 노래: 46794: 내몸이불타오르고있어 - 기리보이 (With 최단비) | Lyricist: 홍시영 | Composer: 홍시영
2024/06/30 20:52:38 Full 노래: 15887: 불타는 사랑 - 이자연 | Lyricist: 김종삼,이승규 | Composer: 박 성훈
2024/06/30 20:52:38 Full 노래: 46373: 불타오르네 (FIRE) - 방탄소년단 | Lyricist: RAP MONSTER,SUGA,HITMAN BANG,PDOGG,DEVINE-CHANNEL1,RYAN KIM(DEVINE CHANNEL2),DEVINE-CHANNEL10,한상희 | Composer: RAP MONSTER,SUGA,HITMAN BANG,PDOGG,DEVINE-CHANNEL1,RYAN KIM(DEVINE CHANNEL2),DEVINE-CHANNEL10,한상희
2024/06/30 20:52:38 Full 노래: 89472: 세계가불타버린밤, 우린... (Can\'t You See Me?) - 투모로우바이투게더 | Lyricist: SLOW RABBIT,SUPREME BOI,HITMAN BANG,ZARESKI ERIC SOLOMON,FONTANA MELANIE JOY,SCHULZ MICHEL,HENDERSO | Composer: SLOW RABBIT,SUPREME BOI,HITMAN BANG,ZARESKI ERIC SOLOMON,FONTANA MELANIE JOY,SCHULZ MICHEL,HENDERSO
2024/06/30 20:52:38 Full 노래: 48358: 남자답게 (막돼먹은영애씨OST) - 박강성 | Lyricist: 불타는고구마1,불타는고구마2 | Composer: 정연태,불타는고구마1,불타는고구마2
2024/06/30 20:52:38 Full 노래: 31594: 불타는연가 - 남진 | Lyricist: 김중순 | Composer: 김희갑
2024/06/30 20:52:38 Full 노래: 30144: 불타는태양 - 미스터타이푼 (Feat.은지원) | Lyricist: TYFOON | Composer: TYFOON
2024/06/30 20:52:38 Full 노래: 86730: 불타는남자 - 에녹 | Lyricist: 미라클2,신동룡,빨간양말1 | Composer: KIYU,미라클2,미라클,신동룡
2024/06/30 20:52:38 Full 노래: 95849: 불타는청춘 (Lovesong) - 박현빈 (Feat.우혜미,허인창) | Lyricist: 김세훈 | Composer: 신응준,김세훈
2024/06/30 20:52:38 Full 노래: 13055: 불타는젊음 - 노브레인 | Lyricist: 차승우 | Composer: 차승우
2024/06/30 20:52:38 Full 노래: 95505: 불타는사랑 - 우연이 | Lyricist: 이수진 | Composer: 설운도
2024/06/30 20:52:38 Full 노래: 84954: 불타는화요일밤에 - 공훈 | Lyricist: 설운도 | Composer: 설운도
2024/06/30 20:52:38 Full 노래: 39674: 불타는금요일 - 김흥국 | Lyricist: 심양구,김흥국 | Composer: 정기수
2024/06/30 20:52:38 Full 노래: 95453: 불타는금요일 (불금) - 김지혜 | Lyricist: 윤정 | Composer: 정환
2024/06/30 20:52:38 Full 노래: 34686: 불타는금요일 (Friday Night) - 다이나믹듀오 | Lyricist: 최재호,김윤성 | Composer: 최재호,김윤성,장재원,김재황
2024/06/30 20:52:38 Function runtime: 55.8131ms
```

> [!WARNING]
> tj미디어의 요청이 있으면 삭제될 수 있습니다.
