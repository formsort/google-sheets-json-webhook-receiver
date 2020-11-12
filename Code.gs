var SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/.../edit';
var SLACK_URL = 'https://hooks.slack.com/services/...';

function doPost(e) {
  var values = getValues(e);
  
  if (SPREADSHEET_URL) {
    handleSpreadsheet(values, SPREADSHEET_URL);
  }
  
  if (SLACK_URL) {
    handleSlack(values, SLACK_URL);
  }
  
  return ContentService.createTextOutput('OK');
}

function getValues(e) {
  var values = JSON.parse(e.postData.contents);
  var answers = values["answers"];
  if (typeof answers === "object") {
    Object.keys(answers)
      .forEach(function(answerLabel) {
        var answer = answers[answerLabel];
        values[answerLabel] = answer != null ? answer.toString() : answer;
      });
    delete values["answers"];
  }
  values['received_at'] = new Date();
  return values;
}

function handleSpreadsheet(values, spreadsheetUrl) {
  var ss = SpreadsheetApp.openByUrl(spreadsheetUrl);
  var sheet = ss.getSheets()[0];
  var headerMap = getExistingKeyColMap(sheet);
  updateKeyColMap(sheet, headerMap, values);
  writeValuesWithHeaderMap(sheet, headerMap, values);
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

function handleSlack(values, slackUrl) {
  var fields = []
  
  var text = Object.keys(values).forEach(function(key) {
    var value = values[key];
    fields.push({
      "type": "mrkdwn",
      "text": key
    }, {
      "type": "mrkdwn",
      "text": "*" + value + "*"
    });
  });
  
  var payload = JSON.stringify({
    text: "New submission!",
    blocks: [
	  {
		"type": "section",
		"fields": fields
      }
    ]
  });

  var headers = {
    "Accept":"application/json", 
    "Content-Type":"application/json"
  };

  var options = {
    "method":"POST",
    "headers": headers,
    "payload": payload
  };
  var response = UrlFetchApp.fetch(slackUrl, options);
}

function test() {
  doPost({
    postData: {
      type: "application/json",
      contents: '{ "hello": "world" }',
    }
  })
}
