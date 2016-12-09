function init(React){

	var ExportPanel = React.createClass({
		dealSave:function(){
			var self = this,
				userInput = React.findDOMNode(self.refs.pathInput).value;

			self.props.onExportCollection && self.props.onExportCollection.call(null,userInput);
		},		
		render:function(){
			var self = this;

			return (
				<div>
					<h4 className="subTitle">Export Postman collection</h4>
						<div className="exportSection">
						<div className="uk-form">
							<label className="uk-form-label" >Collection file path:</label>
							<input className="uk-form-large" ref="pathInput" defaultValue={self.props.defaultValue} type="text" width="300"/>
						</div></div>
				    <div className="exportSection-btn">
		            	        <button type="button" className="uk-button" onClick={self.dealSave}>Save</button>
	                        </div>
				</div>
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