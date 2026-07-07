# todo-app

핑크 테마의 모바일 프레임 TODO 앱입니다. 빌드 도구 없이 `index.html` 하나로 동작합니다.

## 주요 기능

- 할 일 입력 + 마감 날짜(`yyyy.mm.dd (요일)`) 등록
- 할 일이 없을 때는 화면 중앙에 입력 폼, 생기면 카드형 캐러셀로 전환
- 할 일 목록 캐러셀과 하단 페이지 숫자 캐러셀이 같은 상태로 동기화
- `localStorage`로 브라우저에 자동 저장
- [google-apps-script/Code.gs](google-apps-script/Code.gs)를 배포하면 구글 시트와 연동해 데이터를 저장할 수 있음 (선택 사항)

## 실행 방법

`index.html`을 브라우저로 열기만 하면 됩니다.

## 구글 시트 연동 (선택)

1. 구글 시트를 만들고 [확장 프로그램 > Apps Script]에 `google-apps-script/Code.gs` 내용을 붙여넣습니다.
2. [배포 > 새 배포] → 웹 앱, 액세스 권한을 "전체 허용"으로 배포합니다.
3. 발급된 웹앱 URL을 `index.html`의 `APPS_SCRIPT_URL` 상수에 넣습니다.
