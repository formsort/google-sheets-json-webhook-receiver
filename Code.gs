var SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/.../edit';


function doPost(e) {
  var ss = SpreadsheetApp.openByUrl(SPREADSHEET_URL);
  var sheet = ss.getSheets()[0];
  
  var headerMap = getExistingKeyColMap(sheet);
  var values = JSON.parse(e.postData.contents);
  var answers = values["answers"];
  if (typeof answers === "object") {
    Object.keys(answers)
      .forEach(function(answerLabel) {
        values[answerLabel] = answers[answerLabel];
      });
    delete values["answers"];
  }

  values['received_at'] = new Date();
  updateKeyColMap(sheet, headerMap, values);
  writeValuesWithHeaderMap(sheet, headerMap, values);
  
  return ContentService.createTextOutput('OK');
}


function getExistingKeyColMap(sheet) {
  var map = {};
  sheet.getRange('1:1').getValues()[0].forEach(function(value, colIndex){
    if (value.trim().length) {
      map[value] = colIndex + 1;
    }
  });
  return map;
}


function updateKeyColMap(sheet, headerMap, values) {
  var maxColIndex = 0;
  Object.keys(headerMap).forEach(function(key) {
    maxColIndex = Math.max(maxColIndex, headerMap[key]);
  });
  
  Object.keys(values).forEach(function(valueKey) {
    if (headerMap[valueKey] !== undefined) {
      return;
    }
    
    // The values object has a key we haven't seen before.
    maxColIndex += 1;
    sheet.getRange(1, maxColIndex).setValue(valueKey);
    headerMap[valueKey] = maxColIndex;
  });
  sheet.setFrozenRows(1);
  
  var headerRow = sheet.getRange("1:1");
  headerRow.setFontWeight("bold");
}

function writeValuesWithHeaderMap(sheet, headerMap, values) {
  const rowIndex = sheet.getLastRow() + 1;
  Object.keys(values).forEach(function(key) {
    const colIndex = headerMap[key];
    sheet.getRange(rowIndex, colIndex).setValue(values[key]);
  });
}

function test() {
  doPost({
    postData: {
      type: "application/json",
      contents: '{ "name": "Test" }',
    }
  })
}
