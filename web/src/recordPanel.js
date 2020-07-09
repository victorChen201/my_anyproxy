function init(React){
	var RecordRow   = require("./recordRow").init(React);

	var RecordPanel = React.createClass({
		getInitialState : function(){
			return {
				list  : [],
				filter: "",
				showedList : []
			};
		},
		render : function(){
			var self          = this,
				rowCollection = [],
				filterStr     = self.state.filter,
				filter        = filterStr;
				self.state.showedList = [];

			//regexp
			if(filterStr[0]=="/" && filterStr[filterStr.length-1]=="/"){
				try{
					filter = new RegExp(filterStr.substr(1,filterStr.length-2));
				}catch(e){}
			}

			for(var i = self.state.list.length-1 ; i >=0 ; i--){
				var item = self.state.list[i];
				if(item){
					if(filter && item){
						try{
							if(typeof filter == "object" && !filter.test(item.url)){
								continue;
							}else if(typeof filter == "string" && item.url.indexOf(filter) < 0){
								continue;
							}
						}catch(e){}
					}

					if(item._justUpdated){
						item._justUpdated = false;
						item._needRender  = true;
					}else{
						item._needRender  = false;
					}

					rowCollection.push(<RecordRow key={item.id} data={item} onSelect={self.props.onSelect.bind(self,item)}></RecordRow>);
					self.state.showedList.push(item.id);
				}
			}

			return (
				<table className="uk-table uk-table-condensed uk-table-hover">
					<thead>
						<tr>
							<th className="col_id">#</th>
							<th className="col_method">method</th>
							<th className="col_code">code</th>
							<th className="col_host">host</th>
							<th className="col_path">path</th>
							<th className="col_mime">mime type</th>
							<th className="col_time">time</th>
							// <th className="col_testtype">test type</th>
							<th className="col_del">del</th>
							<th className="col_add">add</th>
						</tr>
					</thead>
					<tbody>
						{rowCollection}
					</tbody>
				</table>
			);
		},
		componentDidUpdate:function(){
			var self = this;
			self.props.onChange && self.props.onChange(self.state.showedList)
		}
	});

	return RecordPanel;
}

module.exports.init = init;