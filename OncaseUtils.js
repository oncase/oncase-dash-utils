


define(["cdf/lib/jquery",CONTEXT_PATH + 'api/repos/pentaho-cdf/js/lib/CCC/protovis.js'], function($, pv) {

	console.log("[OncaseUtils] Module loaded");
	var _resizeableCharts = [],
	    date = new Date();
    	dateLastWeek = new Date(),
    	weekDays = {
    		"en" : ["Sun","Mon","Tue","Wed", "Thu", "Fri", "Sat"],
    		"pt" : ["Dom","Seg","Ter","Qua", "Qui", "Sex", "Sab"]

    	};
    dateLastWeek.setDate(dateLastWeek.getDate()-7);

	function _pushResizeable(component){

		for(c=0;c<_resizeableCharts.length;c++){
			if(_resizeableCharts[c].name === component.name)
				return;
		}
		console.log("[OncaseUtils] push resizeable "+component.name);
		_resizeableCharts.push(component);
	}

	function _implementWeek(){

		Date.prototype.getWeek = function () {  
		    // Create a copy of this date object  
		    var target  = new Date(this.valueOf());  
		  
		    // ISO week date weeks start on monday  
		    // so correct the day number  
		    var dayNr   = (this.getDay() + 6) % 7;  
		  
		    // ISO 8601 states that week 1 is the week  
		    // with the first thursday of that year.  
		    // Set the target date to the thursday in the target week  
		    target.setDate(target.getDate() - dayNr + 3);  
		  
		    // Store the millisecond value of the target date  
		    var firstThursday = target.valueOf();  
		  
		    // Set the target to the first thursday of the year  
		    // First set the target to january first  
		    target.setMonth(0, 1);  
		    // Not a thursday? Correct the date to the next thursday  
		    if (target.getDay() != 4) {  
		        target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);  
		    }  
		  
		    // The weeknumber is the number of weeks between the   
		    // first thursday of the year and the thursday in the target week  
		    return 1 + Math.ceil((firstThursday - target) / 604800000); // 604800000 = 7 * 24 * 3600 * 1000  
		} 



		Date.prototype.getWeekYear = function ()   
		{  
		    // Create a new date object for the thursday of this week  
		    var target  = new Date(this.valueOf());  
		    target.setDate(target.getDate() - ((this.getDay() + 6) % 7) + 3);  
		      
		    return target.getFullYear();  
		}  


	}
	_implementWeek();
	$( window ).resize(function() {
		_resizeComponents();
	});

	/*
		Rounds <rect> svg shapes

		This method needs to be called on postExecution.
		It uses jQuery to "physically" change rx and ry from every <rect/>
		inside of the component's htmlObject.
	 */
	 
	function _barRound(component, radius){

		var rxy = radius.toString();

		$("#"+component.htmlObject + " svg rect")
		        .attr("rx",rxy)
		        .attr("ry",rxy)
		        .attr("shape-rendering","");
	}

	/*
		Sets component height based to a multiplier that is going to operate
		over a given number.

		Ex.: barRound(this,cda.resultset.length, 50)
		 - cda.resultset.length being 5
		 - will set the component height to 250px
	 */
	 
	function _setHeightMultiplier(component, quantity, each){
		_setHeight( component, quantity * each );
	}


	/*
		Replaces null values into a CDA resultset
		for a specified @val. It searches the resultset
		from the row index @fromR and from the col index @fromC
	 */
	function _coalesce(cda, val, fromR, fromC){

		var fR = fromR | 0,
		 	fC = fromC | 0;

		var rs = cda.resultset;

	    for(z=fR;z<rs.length;z++){
	        for(y=fC;y<rs[z].length;y++){
	            if(rs[z][y]===null)
	                rs[z][y]=val;
	        }
	    }
	}

	/*
		Sets components width
	 */
	function _setWidth(component, width){
		component.chartDefinition.width = width;
	}


	/*
		Gets components width
	 */
	function _getCompWidth(component){
		return component.chartDefinition.width;
	}


	/*
		Sets components container's width
	 */
	function _getParentWidth(component){
		return $("#"+component.htmlObject).width();
	}


	/*
		Sets components height
	 */
	function _setHeight(component, height){
		component.chartDefinition.height = height;
	}

	/*
		Gets components height
	 */
	function _getCompHeight(component){
		return component.chartDefinition.height;
	}

	/*
		Sets components container's height
	 */
	function _getParentHeight(component){
		return $("#"+component.htmlObject).height();
	}

	/*
		Gets the charts xScale height in pixels.
		This is useful for ligning/sizing up other dom components
		to the axes. To be used on extension points

		ex.: bar_visible : function(){
		    var barsWidth = OncaseUtils.getXScale(this)-2;
		    $(".sm-sentiment-legend-realwidth").width(barsWidth);
		    return true;
		}

	 */
	function _getXScale(obj){
		return obj.chart.xScale.max;
	}

	/*
		See _getXScale
	 */
	function _getYScale(obj){
		return obj.chart.yScale.max;
	}


	/*
		[[ _placeLabelsBaseTopH functions ]]

		This group of functions are specific for horizontal charts values 
		placement. 
	 */
	function _getPanelWidthH(obj){
		return obj.panel._layoutInfo.clientSize.width;
	}

	function _getBarRightH(obj){
		return obj.sign.getAnchoredToMark()["right"]();
	}

	function _getBarSizeH(obj){
		return _getPanelWidthH(obj) - _getBarRightH(obj);
	}

	function _getValueValue(scene){
		return scene.datum.atoms.value.value;
	}

	function _getCategoryLabel(scene){
		return scene.atoms.category.label;
	}
	function _getSeriesLabel(scene){
		return scene.atoms.series.label;
	}

	function _getValueNumChars(scene){
		return _getValueValue(scene).toFixed(0).length;
	}

	function _placeLabelsBaseTopH(obj, scene){
		return _getBarSizeH(obj) > _getValueNumChars(scene) ? "left" : "right";
	}

	/*
		// [[ _placeLabelsBaseTopH functions ]]
	 */


	 /*
	 	Given a formatted number with suffix (ex.: 12,21K)
	 	returns an array with the number part into the 0 index
	 	and the suffix on the 1 index.

	 	This is useful for giving separate styles to each part.
	  */
	function _getNumberAndSuffix(formattedNumber){
	    
	    var exec = /[a-zA-Z]/gi.exec(formattedNumber);
	    
	    if(exec===null)
	        return [formattedNumber,""];
	        
	    var position = exec.index;

	    suffix = formattedNumber.substring(position);
	    
	    formattedNumber = formattedNumber.substring(0,position);
	    return [formattedNumber, suffix];

	} 


	function _getCurrentYear(){return date.getFullYear();}
	function _getYearLastWeek(){return dateLastWeek.getFullYear();}

	function _getCurrentWeek(){return date.getWeek();}
	function _getWeekLastWeek(){return dateLastWeek.getWeek();}

	function _reRender(component){
		component.chart.options.width = _getParentWidth(component);
		component.chart.options.height = _getParentHeight(component);
		component.chart.render(/*bypassAnimation*/true, /*recreate*/true, /*reload*/false);
	}

	function _resizeComponents(){
		for(w=0;w<_resizeableCharts.length;w++){
			_reRender(_resizeableCharts[w]);
		}
	}





	function _interpolate(component, what, interpolation){
		console.log(component);
		// component.chartDefinition.extensionPoints.push(
		// 		[ what+"_interpolation" , '"'+interpolation+'"' ]
		// );
	}


	/*
		This returns a panel to be added to a baseAxisLabel
		Adding a panel there enables you tu have a double lined
		category label.

		Ex. usage [extension points]:
		    comp.chartDefinition.baseAxisLabel_add = function (scene) {
		        var elm = OncaseUtils.getSecondLine(function(a){
		            var year = 
		                this.parent.parent.children[0]
		                    .getScene().atoms.category.rawValue.split("-")[0];
		            return year;
		        }, 25);
		        return elm;
		    };
	 */
	function _getSecondLine( value, top, font, textStyle){
		var elm = new pv.Panel(),
			textStyle = typeof textStyle !== 'undefined' ? textStyle : 24;
			top = typeof top !== 'undefined' ? top : 24;
   			font = typeof font !== 'undefined' ? font : 'sans-serif 12px';
		elm
			.width(0)
			.add(pv.Label)
			.top(top)
			.textStyle(textStyle)
			.font(font)
			.textAlign("center")
	    	.text(value);	

	    return elm;
	}

	function _getPv(){
		return pv;
	}

	/*
		It's self explanatory.
		But 1=sunday / the first day of the week here
	 */
	function _getWeekDay(number, locale){
		number = parseInt(number,10)-1;
		return weekDays[locale][number];
	}


	/*
		TODO: treat this options values for nulls, undefineds, etc. 
	 */
	function _configChart(chart, options){

		var options = typeof options !== 'object' ? {} : options,
			linesHidden = typeof options.linesHidden === undefined ? false : options.linesHidden,
			extensionPoints = typeof options.extensionPoints === undefined ? [] : options.extensionPoints,
			def = chart.chartDefinition;

		if(linesHidden){
			def.axisRule_lineWidth = 0;
		}

		for(x=0;x<extensionPoints.length;x++){
			def[extensionPoints[x][0]] = extensionPoints[x][1];
		}


	}


	function _arrayRunningTotalForIndex(arr, colIndex, tillIndex, reverse){
		reverse = typeof reverse === undefined ? false : reverse;
		var acc = 0,
			arr = arr.slice(1);

		if(reverse)
			arr.reverse();

		for(x=0;x<tillIndex;x++){
			acc += arr[x][colIndex];
		}
		return acc;
	}

	function _arrayTotalForIndex(arr,colIndex){
		var acc=0;
		for(x=0;x<arr.length;x++)
			acc += arr[x][colIndex];

		return acc;
	}

	/*
		Public stuff
	 */

    return {

    	arrayRunningTotalForIndex : _arrayRunningTotalForIndex,
    	arrayTotalForIndex : _arrayTotalForIndex,

        barRound : _barRound,
        setHeightMultiplier : _setHeightMultiplier,
        coalesce : _coalesce,

        setWidth : _setWidth,
        getCompWidth : _getCompWidth,
        getParentWidth : _getParentWidth,

        setHeight : _setHeight,
        getCompHeight : _getCompHeight,
        getParentHeight : _getParentHeight,

        getYScale : _getYScale,
        getXScale : _getXScale,
        placeLabelsBaseTopH : _placeLabelsBaseTopH,
        getValueValue : _getValueValue,

        pushResizeable : _pushResizeable,

        getNumberAndSuffix : _getNumberAndSuffix,

        getCurrentYear : _getCurrentYear,
        getYearLastWeek : _getYearLastWeek,
        getCurrentWeek : _getCurrentWeek,
        getWeekLastWeek : _getWeekLastWeek,
        interpolate : _interpolate,
        getSecondLine : _getSecondLine,
        getPv : _getPv,
        getBaseAxisLabel : _getCategoryLabel,
        getCategoryLabel : _getCategoryLabel,
        getSeriesLabel : _getSeriesLabel,
        getWeekDay : _getWeekDay,
        configChart : _configChart

    };
});