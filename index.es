const { _, $, $$, React, ReactBootstrap, FontAwesome } = window;
const { Button, Col, Row, Grid, Input } = ReactBootstrap;
const windowManager = remote.require('./lib/window');
let exWindow = null;

let sendPost = () => {
  if (exWindow !== null) {
    try {
      windowManager.closeWindow(exWindow);
    } catch (e) {
    } finally {
      exWindow = null;
    }
  };
  exWindow = windowManager.createWindow({
    width: 870,
    height: 660,
    resizable: true,
    realClose: true,
    backgroundColor: '#FFF',
    webPreferences: {
      webSecurity: false,
      plugins: true,
      enableLargerThanScreen: true
    }
  });
  exWindow.loadURL(`file://${__dirname}/index.html`);
  let ships = [];
  for (var keys in _ships) {
    ships.push(_ships[keys].api_ship_id)
  };
  let fleet = []
  for (var i = 0; i < 4; i++) {
    let currentFleet = [];
    if (_decks[i] !== undefined && _decks[i] !== -1) {
      for (var j = 0; j < 6; j++) {
        if (_decks[i].api_ship[j] !== undefined && _decks[i].api_ship[j] !== -1) {
          console.log()
          currentFleet.push({
            lvl: _ships[_decks[i].api_ship[j]].api_lv,
            id: _ships[_decks[i].api_ship[j]].api_ship_id,
          });
        }
        else {
          currentFleet.push(null);
        }
      }
    }
    else {
      currentFleet = null;
    }
    fleet.push(currentFleet)
  };
  let ttkName = _nickName;
  let ttkLvl = _teitokuLv;
  let k2Flag = 'on'
  let colleFlag = 'on'
  let ttkServer = 1; // todo: server detection
  let postMessage = {
    ttkLvl: ttkLvl,
    ttkName: ttkName,
    ttkServer: ttkServer,
    k2Flag: k2Flag,
    colleFlag: colleFlag,
    ships: JSON.stringify(ships),
    fleet: JSON.stringify(fleet)
  };
  exWindow.webContents.executeJavaScript(`
      var form = document.querySelector('#k2badge-poster');
      var postMessage = ${JSON.stringify(postMessage)};
      for (var keys in postMessage) {
        var target = document.querySelector("#k2badge-" + keys);
        target.setAttribute("name", keys);
        target.setAttribute("value", postMessage[keys]);
      };
      var url = "http://threebards.com/kaini/";
      var language = "${window.language}";
      switch (language) {
        case 'zh-CN':
          url = url + "index-cn.php";
          break;
        case 'zh-TW':
          url = url + "index-cn.php";
          break;
        case 'ja-JP':
          url = url + "index-jp.php"
          break;
        default:
          url = url + "index.php";
          break;
      };
      form.setAttribute("action", url);
      form.submit();
    `);
  exWindow.webContents.on('dom-ready', (e) => {
    exWindow.webContents.executeJavaScript(`
      document.querySelector('body').style.backgroundColor = '#FFF';
      remote = require('electron').remote;
      try {
        $('#export').off('click');
        $("#export").on("click", function() {
            remote.getCurrentWebContents().downloadURL(document.getElementById("result").toDataURL())
        });
      }
      catch (e) {
        console.log(e);
      };
      `);
  })
  exWindow.show();
}

const ExportData = {
  pluginWillUnload: (e) => {
    if (exWindow !== null) {
      try {
        windowManager.closeWindow(exWindow);
      } catch (e) {
      } finally {
        exWindow = null;
      }
    }
  },
  handleClick: sendPost
}

export default ExportData
