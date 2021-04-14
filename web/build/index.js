window.$ = window.jQuery = require("../lib/jquery");

var EventManager    = require('../lib/event'),
	Anyproxy_wsUtil = require("../lib/anyproxy_wsUtil"),
	React           = require("../lib/react");

var WsIndicator = require("./wsIndicator").init(React),
	RecordPanel = require("./recordPanel").init(React),
	Popup       = require("./popup").init(React);

var PopupContent = {
	map    : require("./mapPanel").init(React),
	detail : require("./detailPanel").init(React),
	filter : require("./filter").init(React),
	exportP : require("./exportPanel").init(React)
};

var ifPause     = false,
    recordSet   = [],
    showedIdSet  = [];

//Event : wsGetUpdate
//Event : recordSetUpdated
//Event : wsOpen
//Event : wsEnd
var eventCenter = new EventManager();

//merge : right --> left
function util_merge(left,right){
    for(var key in right){
        left[key] = right[key];
    }
    return left;
}

//invoke AnyProxy web socket util
(function(){
	try{
		var ws = window.ws = new Anyproxy_wsUtil({
			baseUrl       : document.getElementById("baseUrl").value,
			port          : document.getElementById("socketPort").value,
			onOpen : function(){
				eventCenter.dispatchEvent("wsOpen");
			},
			onGetUpdate : function(record){
				eventCenter.dispatchEvent("wsGetUpdate",record);
			},
			onError     : function(e){
				eventCenter.dispatchEvent("wsEnd");
			},
			onClose     : function(e){
				eventCenter.dispatchEvent("wsEnd");
			}
		});
		window.ws = ws;
		
	}catch(e){
		alert("failed to invoking web socket on this browser");
	}
})();


//websocket status indicator
(function(){
	var wsIndicator = React.render(
		React.createElement(WsIndicator, null),
		document.getElementById("J_indicatorEl")
	);

	eventCenter.addListener("wsOpen",function(){
		wsIndicator.setState({
			isValid : true
		});
	});

	eventCenter.addListener("wsEnd",function(){
		wsIndicator.setState({
			isValid : false
		});
	});	
})();


//init popup
var showPop,
	hidePop;
(function(){
	$("body").append('<div id="J_popOuter"></div>');
	var pop = React.render(
		React.createElement(Popup, null),
		document.getElementById("J_popOuter")
	);

	showPop = function(popArg){
		var stateArg = util_merge({show : true },popArg);
		pop.setState(stateArg);
	};
	hidePop = function(){
		pop.setHide();
	};
})();

//init record panel
var recorder;
(function(){
	function updateRecordSet(newRecord){
		if(ifPause) return;

		if(newRecord && newRecord.id){
			if(!recordSet[newRecord.id]){
				recordSet[newRecord.id] = newRecord;
			}else{
				util_merge(recordSet[newRecord.id],newRecord);
			}

			recordSet[newRecord.id]._justUpdated = true;
			// React.addons.Perf.start();
			eventCenter.dispatchEvent("recordSetUpdated");
			// React.addons.Perf.stop();
		}
	}

	function initRecordSet(){
		$.getJSON("/lastestLog",function(res){
			if(typeof res == "object"){
				res.map(function(item){
					if(item.id){
						recordSet[item.id] = item;
					}
				});
				eventCenter.dispatchEvent("recordSetUpdated");
			}
		});
	}

	eventCenter.addListener("wsGetUpdate",updateRecordSet);

	eventCenter.addListener('recordSetUpdated',function(){
		recorder.setState({
			list : recordSet
		});
	});

	eventCenter.addListener("filterUpdated",function(newKeyword){
		recorder.setState({
			filter: newKeyword
		});
	});

	function showDetail(data,event){
		if(event.target.className == 'uk-icon-eraser')
		{

			recordSet[data.id] = null;
			eventCenter.dispatchEvent("recordSetUpdated");
		}
		else if(event.target.className == 'uk-icon-refresh')
		{
			console.log("aaaaaa",data);
			var data = {
				type: 'export',
				path: resObj.fullPath,
				data: [data.id]
			}

			// var defaultPath = resObj.fullPath + "/default.postman_collection";
			// var ExportPanel = PopupContent["exportP"];
			// exportPanelEl = (React.createElement(ExportPanel) );
			// showPop({ left:"60%", content:exportPanelEl });
			ws.send(data,function(){})
		}
		else
		showPop({left:"35%",content:React.createElement(PopupContent["detail"], {data:data})});
	}

	function updateShowedSet(idSet){
		showedIdSet = idSet;
	}

	//init recorder panel
	recorder = React.render(
		React.createElement(RecordPanel, {onChange: updateShowedSet, onSelect: showDetail}),
		document.getElementById("J_content")
	);

	initRecordSet();
})();


//action bar
(function(){

	//clear log
	function clearLogs(){
		recordSet = [];
		eventCenter.dispatchEvent("recordSetUpdated");
	}

	$(document).on("keyup",function(e){
		if(e.keyCode == 88 && e.ctrlKey){ // ctrl + x
			clearLogs();
		}
	});

	var clearLogBtn = $(".J_clearBtn");
	clearLogBtn.on("click",function(e){
		e.stopPropagation();
		e.preventDefault();
		clearLogs();
	});

	//start , pause
	var statusBtn = $(".J_statusBtn");
	statusBtn.on("click",function(e){
		e.stopPropagation();
		e.preventDefault();

		$(".J_statusBtn").removeClass("btn_disable");
		$(this).addClass("btn_disable");

		if(/stop/i.test($(this).html()) ){
			ifPause = true;
		}else{
			ifPause = false;
		}
	});

	var exportBtn = $(".J_exportContainer");
	exportBtn.on("click",function(e){
		e.stopPropagation();
		e.preventDefault();
		$.getJSON("getRootPath",function(resObj){
			var defaultPath = resObj.fullPath + "/default.postman_collection";
			var ExportPanel = PopupContent["exportP"];
			exportPanelEl = (React.createElement(ExportPanel, {defaultValue: defaultPath, onExportCollection: exportCollection}) );
			showPop({ left:"60%", content:exportPanelEl });			
		});
		
		
	});	

	function exportCollection(userInput){
		// var idList = [];
		// for (key in recordSet) {
		// 	if(recordSet[key])
		// 		idList.push(key);
		// };
		var data = {
			type: 'export',
			path: userInput, 
			data: showedIdSet
		};
		console.log(userInput);
		ws.send(data,function(){
			hidePop();
		});
	}

	//preset button
	(function (){
		var TopBtn = React.createClass({displayName: "TopBtn",
			getInitialState: function(){
				return {
					inUse : false
				};
			},
			render: function(){
				var self = this,
					iconClass = self.state.inUse ? "uk-icon-check"      : self.props.icon,
					btnClass  = self.state.inUse ? "topBtn topBtnInUse" : "topBtn";

				return React.createElement("a", {href: "#"}, React.createElement("span", {className: btnClass, onClick: self.props.onClick}, React.createElement("i", {className: iconClass}), self.props.title))
			}
		});

		// filter
		var filterBtn,
		    FilterPanel = PopupContent["filter"],
			filterPanelEl;

		filterBtn = React.render(React.createElement(TopBtn, {icon: "uk-icon-filter", title: "Filter", onClick: filterBtnClick}), document.getElementById("J_filterBtnContainer"));
		filterPanelEl = (React.createElement(FilterPanel, {onChangeKeyword: updateKeyword}) );

		function updateKeyword(key){
			eventCenter.dispatchEvent("filterUpdated",key);
			filterBtn.setState({inUse : !!key});
		}
		function filterBtnClick(){
			showPop({ left:"60%", content:filterPanelEl });
		}

		// map local
		var mapBtn,
			mapPanelEl;
		function onChangeMapConfig(cfg){
			mapBtn.setState({inUse : cfg && cfg.length});
		}

		function mapBtnClick(){
			showPop({left:"60%", content:mapPanelEl });
		}

		//detect whether to show the map btn
		require("./mapPanel").fetchConfig(function(initConfig){
			var MapPanel = PopupContent["map"];
			mapBtn     = React.render(React.createElement(TopBtn, {icon: "uk-icon-shield", title: "Map Local", onClick: mapBtnClick}),document.getElementById("J_filterContainer"));
			mapPanelEl = (React.createElement(MapPanel, {onChange: onChangeMapConfig}));
			onChangeMapConfig(initConfig);
		});

		var t = true;
		setInterval(function(){
			t = !t;
			// mapBtn && mapBtn.setState({inUse : t})
		},300);



	})();

	//other button
	(function(){
		$(".J_customButton").on("click",function(){
			var thisEl = $(this),
				iframeUrl = thisEl.attr("iframeUrl");

			if(!iframeUrl){
				throw new Error("cannot find the url assigned for this button");
			}

			var iframeEl = React.createElement("iframe",{src:iframeUrl,frameBorder:0});
			showPop({left:"35%", content: iframeEl });
		});
	})();

})();