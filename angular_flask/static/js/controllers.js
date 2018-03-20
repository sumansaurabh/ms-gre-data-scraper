'use strict';

/* Controllers */

function IndexController($scope, $http) {
	$scope.form_content = {
		search_key : "",
		page_limit: 5
	}

	function noe(i) {
        return [undefined, null, ''].indexOf(i) > -1;
    }

    function is_empty_object(i) {
        return Object.keys(i).length === 0;
    }

    function coalesce(value, default_value) {

        if(noe(value)) {
            return noe(default_value) ? "" : default_value;
        }
        return value;
    }



	function format_table_data(data) {

		return data.map(function(itm){
			return [coalesce(itm['date'], "n/a"), 
				coalesce(itm['institute'], "n/a"), 
				coalesce(itm['program'], "n/a"), 
				coalesce(itm['decision_type'],"n/a"),  
				coalesce(itm['marks']['QUANT'], "n/a"), 
				coalesce(itm['marks']['VERBAL'], "n/a"), 
				coalesce(itm['marks']['AWA'], "n/a"), 
				coalesce(itm['marks']['GPA'], "n/a"), 
				coalesce(itm['notes_added'].join("\n"), "n/a") ]
		});
	}

	function create_table(data) {

		$("#gradcafe-create-table").html('<table id="gradcafe-table" class="display" width="100%"></table>');


		var columns = [{
            	title : "Date",
            	width: '5%',
            	text_width: '40px'
            },{
            	title : "Institution",
            	width: '18%',
            	text_width: '350px'
            }, {
            	title : "Program",
            	width: '15%',
            	text_width: '220px'
            }, {
            	title : "Decision",
            	width: '10%',
            	text_width: '120px'
            }, {
            	title : "Quant",
            	width: '5%',
            	text_width: '30px'
            },{
            	title : "Verbal",
            	width: '5%',
            	text_width: '30px'
            },{
            	title : "AWA",
            	width: '5%',
            	text_width: '30px'
            },{
            	title : "GPA",
            	width: '5%',
            	text_width: '30px'
            },{
            	title : "Notes",
            	width: '20%',
            	text_width: '260px'
            }];

            var row_data = format_table_data(data);
            console.log(row_data)

            var graph_configuration = $('#gradcafe-table').removeAttr('width').DataTable( {
		        data: row_data,
		        columns: columns,
		        "columnDefs": [{ "width": "5%", "targets": 0 },
		        	{ "width": "20%", "targets": 1 },
		        	{ "width": "10%", "targets": 2 },
		        	{ "width": "10%", "targets": 3 },
		        	{ "width": "5%", "targets": 4},
		        	{ "width": "5%", "targets": 5 },
		        	{ "width": "5%", "targets": 6 },
		        	{ "width": "5%", "targets": 7 },
		        	{ "width": "20%", "targets": 8 }],
		        fixedColumns: true
		    });

		    function column_based_filter() {
		    	var table_container =  $('#gradcafe-table');

		    	var _thead = table_container.find('thead')
                var x1 =  _thead.find('.col-search-text');
                x1.remove();
                var org_idx_map = {}
                _thead.append('<tr class="col-search-text"></tr>');
                columns.forEach(function(series_item, idx){
                    var inp = '<th><div class="search-box-cnt" style="width:'+columns[idx]['width']+'">'+
                                '<input class="app-search-box transparent no_margin_right iq-table-col-search-'+idx+'" type="text" style="width:'+columns[idx]['text_width']+'" >'+
                              '</div></th>'

                    _thead.find('tr:last-child').append(inp)
                })

                graph_configuration.columns().every( function (idx) {
                    var that = this;
                    $('#gradcafe-table .iq-table-col-search-'+that[0]['0']).on( 'keyup change', function () {
                        that.search( this.value ).draw();
                    });
                });
		    }
		    column_based_filter();
	}

	function fetch_line_chart_data(data) {
		var quant = {
			accepted : [],
			rejected: []
		};

		var verbal = {
			accepted : [],
			rejected: []
		}

		data.forEach(function(itm){
			if(!noe(itm['marks']['QUANT'])){
				itm['marks']['QUANT'] = parseInt(itm['marks']['QUANT'])
				
				if(itm['marks']['QUANT'] > 170 || itm['marks']['QUANT'] < 130) return;

				if(itm['decision_type'] === "Accepted") {
					quant.accepted.push(parseInt(itm['marks']['QUANT']));
				} else {
					quant.rejected.push(parseInt(itm['marks']['QUANT']));
				}
			}

			if(!noe(itm['marks']['VERBAL'])){
				if(itm['marks']['VERBAL'] > 170 || itm['marks']['VERBAL'] < 130) return;

				if(itm['decision_type'] === "Accepted") {
					verbal.accepted.push(parseInt(itm['marks']['VERBAL']));
				} else {
					verbal.rejected.push(parseInt(itm['marks']['VERBAL']));
				}
			}
		});
		console.log(quant);

		return [quant, verbal];
	}

	function create_linechart(data) {
		var line_chart_data = fetch_line_chart_data(data);
		console.log(line_chart_data);

		Highcharts.chart('line-chart-quant', {

		    title: {
		        text: 'Quant Accept/Reject'
		    },
		    yAxis: {
		        title: {
		            text: 'Marks'
		        }
		    },
		    legend: {
		        layout: 'vertical',
		        align: 'right',
		        verticalAlign: 'middle'
		    },

		    plotOptions: {
		        series: {
		            label: {
		                connectorAllowed: false
		            },
		            pointStart: 1
		        }
		    },

		    series: [{
		        name: 'Accepted',
		        data: line_chart_data[0].accepted
		    }, {
		        name: 'Rejected',
		        data: line_chart_data[0].rejected
		    }]

		});

		Highcharts.chart('line-chart-verbal', {

		    title: {
		        text: 'Verbal Accept/Reject'
		    },
		    yAxis: {
		        title: {
		            text: 'Marks'
		        }
		    },
		    legend: {
		        layout: 'vertical',
		        align: 'right',
		        verticalAlign: 'middle'
		    },

		    plotOptions: {
		        series: {
		            label: {
		                connectorAllowed: false
		            },
		            pointStart: 1
		        }
		    },

		    series: [{
		        name: 'Accepted',
		        data: line_chart_data[1].accepted
		    }, {
		        name: 'Rejected',
		        data: line_chart_data[1].rejected
		    }]

		});


	}

	$scope.fetch_grad_cafe_data = function() {
		var x = $scope.form_content.search_key.split(" ").join("+")
		var url = "/gradscraper";
		if($scope.form_content.page_limit > 15) {
			$scope.form_content.page_limit = 15
		}


		$http.post(url, {search_key: x, page: $scope.form_content.page_limit}).then(function(response) {
            
            console.log(response)
            var data = response.data.data;
            create_table(data);
            create_linechart(data);



            
        }, function(err) {
            console.log(err);
        });
	}

}

function AboutController($scope) {
	
}

function PostListController($scope, Post) {
	var postsQuery = Post.get({}, function(posts) {
		$scope.posts = posts.objects;
	});
}

function PostDetailController($scope, $routeParams, Post) {
	var postQuery = Post.get({ postId: $routeParams.postId }, function(post) {
		$scope.post = post;
	});
}
