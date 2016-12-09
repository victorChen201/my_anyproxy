function init(React){

	var ExportPanel = React.createClass({displayName: "ExportPanel",
		dealSave:function(){
			var self = this,
				userInput = React.findDOMNode(self.refs.pathInput).value;

			self.props.onExportCollection && self.props.onExportCollection.call(null,userInput);
		},		
		render:function(){
			var self = this;

			return (
				React.createElement("div", null, 
					React.createElement("h4", {className: "subTitle"}, "Export Postman collection"), 
						React.createElement("div", {className: "exportSection"}, 
						React.createElement("div", {className: "uk-form"}, 
							React.createElement("label", {className: "uk-form-label"}, "Collection file path:"), 
							React.createElement("input", {className: "uk-form-large", ref: "pathInput", defaultValue: self.props.defaultValue, type: "text", width: "300"})
						)), 
				    React.createElement("div", {className: "exportSection-btn"}, 
		            	        React.createElement("button", {type: "button", className: "uk-button", onClick: self.dealSave}, "Save")
	                        )
				)
			);
		},
		setFocus:function(){
			var self = this;
			React.findDOMNode(self.refs.pathInput).focus();
		},
		componentDidUpdate:function(){
			this.setFocus();
		},		
		componentDidMount:function(){
			this.setFocus();
		}		
	});

	return ExportPanel;
}

module.exports.init = init;