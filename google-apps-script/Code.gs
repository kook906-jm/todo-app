/**
 * TODO 앱 ↔ 구글 시트 연동용 Apps Script
 *
 * ── 설정 방법 ──
 * 1. 구글 시트를 새로 만들고, 이 스크립트를 [확장 프로그램 > Apps Script]에서 붙여넣습니다.
 * 2. SHEET_NAME과 같은 이름의 탭이 없으면 실행 시 자동으로 만들어지고 헤더도 자동 생성됩니다.
 * 3. [배포 > 새 배포] → 유형: "웹 앱"
 *      - 실행 대상: 나
 *      - 액세스 권한: 전체 허용 (Anyone) ← 이걸 선택해야 어떤 사이트에서도 로그인 없이 호출 가능합니다.
 * 4. 배포 후 발급되는 웹앱 URL을 index.html의 APPS_SCRIPT_URL 상수에 붙여넣으세요.
 *
 * ── 시트 컬럼 ──
 * id | text | dueDate | done | createdAt | updatedAt
 */

const SHEET_NAME = "Todos";
const HEADERS = ["id", "text", "dueDate", "done", "createdAt", "updatedAt"];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

function readAll_() {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  return values
    .slice(1)
    .filter(row => row[0] !== "" && row[0] !== null)
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      obj.id = String(obj.id);
      obj.done = obj.done === true || obj.done === "TRUE";
      if (obj.dueDate instanceof Date) {
        obj.dueDate = Utilities.formatDate(obj.dueDate, Session.getScriptTimeZone(), "yyyy-MM-dd");
      }
      return obj;
    });
}

function findRowIndexById_(sheet, id) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) return i + 2; // 실제 시트 행 번호 (헤더=1행)
  }
  return -1;
}

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** 목록 조회: GET {URL}?action=list */
function doGet(e) {
  try {
    const action = (e.parameter && e.parameter.action) || "list";
    if (action === "list") {
      return jsonOutput_({ ok: true, data: readAll_() });
    }
    return jsonOutput_({ ok: false, error: "지원하지 않는 action입니다: " + action });
  } catch (err) {
    return jsonOutput_({ ok: false, error: String(err) });
  }
}

/**
 * 생성/수정/삭제: POST { action: "create" | "update" | "delete", ... }
 * 브라우저 CORS 프리플라이트를 피하기 위해 요청 Content-Type은 text/plain으로 보내고
 * 이 함수에서 JSON.parse로 직접 파싱합니다.
 */
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const sheet = getSheet_();
    const now = new Date().toISOString();

    if (action === "create") {
      if (!body.text || !body.dueDate) {
        return jsonOutput_({ ok: false, error: "text와 dueDate는 필수입니다." });
      }
      const id = String(Date.now());
      sheet.appendRow([id, body.text, body.dueDate, false, now, now]);
      return jsonOutput_({ ok: true, data: readAll_() });
    }

    if (action === "update") {
      const rowIndex = findRowIndexById_(sheet, body.id);
      if (rowIndex === -1) {
        return jsonOutput_({ ok: false, error: "해당 id를 찾을 수 없습니다: " + body.id });
      }
      if (body.text !== undefined) sheet.getRange(rowIndex, 2).setValue(body.text);
      if (body.dueDate !== undefined) sheet.getRange(rowIndex, 3).setValue(body.dueDate);
      if (body.done !== undefined) sheet.getRange(rowIndex, 4).setValue(!!body.done);
      sheet.getRange(rowIndex, 6).setValue(now);
      return jsonOutput_({ ok: true, data: readAll_() });
    }

    if (action === "delete") {
      const rowIndex = findRowIndexById_(sheet, body.id);
      if (rowIndex === -1) {
        return jsonOutput_({ ok: false, error: "해당 id를 찾을 수 없습니다: " + body.id });
      }
      sheet.deleteRow(rowIndex);
      return jsonOutput_({ ok: true, data: readAll_() });
    }

    return jsonOutput_({ ok: false, error: "지원하지 않는 action입니다: " + action });
  } catch (err) {
    return jsonOutput_({ ok: false, error: String(err) });
  }
}
