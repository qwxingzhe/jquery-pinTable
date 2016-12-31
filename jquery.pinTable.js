/**
* jQuery.table.pin - 表格固定插件,配合jquery pin使用
* Written by 行者 
* Date: 2016年12月31日
* @author 行者
* @version 0.0.2
**/
(function ($) {
    $.fn.extend({
        pinTable:function(opt){
            var defaultOpt          = {leftNum:0};
            var table               = $(this);
            var tableHtml           = table.prop("outerHTML");
            var par_div_id          = 'par_div_id'  + parseInt(Math.random()*10000);
            var tr_table_id         = 'tr_table_id' + parseInt(Math.random()*10000);
            var tr_left_table_id    = 'tr_left_table_id'   + parseInt(Math.random()*10000);
            var main_left_table_id  = 'main_left_table_id' + parseInt(Math.random()*10000);
            var table_offset_top    = table.offset().top;   //表格距离顶部高度
            var table_offset_left   = table.offset().left;  //表格距离左边距离
            var table_height        = table.height();
            var tr_header_height    = table.find('tr:eq(0)').height();
            var table_bottom_to_top = table_offset_top + table_height - tr_header_height;
            opt                     = $.extend(defaultOpt,opt);
            // console.log(opt);
            
            //创建顶部浮动框
            var createTopTable = function(){
                //首先将整个table包到一个div中
                table.wrap(function() {
                    return '<div id="'+par_div_id+'" class="" />';
                });

                //将table的首行提取出来单独存放成一块
                var firstTr = table.find('tr:eq(0)').prop("outerHTML");
                //

                table.before('<table id="'+tr_table_id+'">'+firstTr+'</table>');
                var attrArr = ['cellpadding','cellspacing','class'];
                for (var i in attrArr) {
                    var attrName = attrArr[i];
                    if( typeof table.attr(attrName) != 'undefined' ){
                        $("#"+tr_table_id).attr(attrName,table.attr(attrName));
                    }
                };

                $("#"+tr_table_id).css({width:table.width()});
                table.find('tr:eq(0)').remove();

            }
            //debugger;
            createTopTable();
            //debugger;
            //return '';
            //顶部主体图片
            var trMainTable         = $("#"+tr_table_id);
            var tr_table_offset_top = trMainTable.offset().top;


            //获取页面滚动偏移
            var GetPageScroll = function (){ 
                var x, y; 
                if(window.pageYOffset){    // all except IE    
                    y = window.pageYOffset;    
                    x = window.pageXOffset; 
                } else if(document.documentElement && document.documentElement.scrollTop) {    // IE 6 Strict    
                    y = document.documentElement.scrollTop;    
                    x = document.documentElement.scrollLeft; 
                } else if(document.body) {    // all other IE    
                    y = document.body.scrollTop;    
                    x = document.body.scrollLeft;   
                } 
                return {x:x, y:y};
            }

            //如果不存在侧边浮动的情况，则直接pin住顶部
            $("#"+tr_table_id).pin({
                containerSelector: "#"+par_div_id
            });

            //表格还原
            var restoreTable = function(errmsg){
                //console.log(tableHtml);
                //将原表格追加的新表格之前
                $("#"+par_div_id).after(tableHtml);
                var nextTable = $("#"+par_div_id).next();

                //删除原表格
                $("#"+par_div_id).remove();

                if( typeof errmsg != 'undefined' ){
                    throw new Error(errmsg);
                }
                return nextTable;
            }


            //复制左侧表格
            var copyLeftTable = function(aimTable,leftNum,new_id_name){
                //需要遍历表格中所有的tr的左侧td，复制存储到新的表格中
                //var newTable = aimTable.find('tr>td:gt('+leftNum+')')
                var newTableHtml = aimTable.prop("outerHTML");

                //将新table复制到老table的左侧
                aimTable.before( newTableHtml );

                //给ID重新赋值
                var newTableObj = aimTable.prev();
                newTableObj.attr('id',new_id_name);

                //跨行存储对象
                var rowspanObj = {};

                //移除不必要的td
                var new_id_name_obj = $("#"+new_id_name);
                var firstTrTdNum    = -1;

                //获取当前行单元格由td还是由th组成
                var cellType            = 'td';
                if(  new_id_name_obj.find('tr:eq(0)').find('th').length>0 ){
                    cellType            = 'th';
                }

                new_id_name_obj.find('tr').each(function( trRowNum ){
                    // $(this).find('td:gt('+ (leftNum-1) +')').remove();
                    // 累加每个td的colspan,获取对应截取tr的次序
                    var tdObj               = $(this).find( cellType );
                    var tempTotalColspanNum = 0;    //单个TR总的跨列数

                    if( typeof rowspanObj[trRowNum] != 'undefined' ){
                        tempTotalColspanNum = rowspanObj[trRowNum].length*1;
                    }
                    //console.log(tempTotalColspanNum);
                    var trNum = 0;                  //遍历的tr总数

                    //历史跨行数组，将其折算到当前列
                    trRowNum *= 1;

                    for (var col in tdObj ) {
                        col *= 1;
                        var tempColspanVal = tdObj.eq(col).attr('colspan');
                        var tempRowspanVal = tdObj.eq(col).attr('rowspan');

                        //跨列
                        if( tempColspanVal ){
                            // console.log('A:'+tempColspanVal);
                            tempTotalColspanNum += tempColspanVal*1;
                        }else{
                            // console.log('B:'+tempColspanVal);
                            tempTotalColspanNum += 1;
                        }

                        //跨行
                        if( tempRowspanVal ){
                            var toRowNum = trRowNum*1+tempRowspanVal*1;
                            // console.log(trRowNum+'-------'+col+'-------'+tempRowspanVal+'-------'+toRowNum);
                            
                            for(var row=trRowNum; row<toRowNum;row++ ){
                                // console.log(row+'-------'+col);
                                if( typeof rowspanObj[row] == 'undefined' ){
                                    rowspanObj[row] = [];
                                }
                                rowspanObj[row].push(col);
                            }
                        }
                        trNum ++;
                        if(tempTotalColspanNum==leftNum){
                            break;
                        }else if(tempTotalColspanNum>leftNum){
                            restoreTable('跨行设置有误！');
                            return false;
                        }
                    };
                    // console.log('tempTotalColspanNum::'+tempTotalColspanNum);

                    if( firstTrTdNum==-1 ){
                        // console.log('firstTrTdNum:'+trNum);
                        firstTrTdNum = trNum;
                    }
                    $(this).find(cellType+':gt('+ (trNum-1) +')').remove();
                })

                // console.log('rowspanObj::::');
                // console.log(rowspanObj);

                // new_id_name_obj.find('tr>td').text('QQQ');
                //new_id_name_obj.find('tr>'+cellType).css({'background-color': '#d00101'});

                //新重置新table的宽度，与原table首行tr占位宽度相等
                //new_id_name_obj.removeProp('style');
                var firstTdObj      = aimTable.find('tr:eq(0)').find(cellType);


                // console.log( '----------------------------------' );
                // console.log( firstTrTdNum );
                // console.log( firstTdObj.html() );
                // console.log( firstTdObj.length );
                // console.log( '----------------------------------' );

                var totalTdWidth    = 0;
                for(var i in firstTdObj){
                    if( i >= firstTrTdNum ){
                        break;
                    }
                    // console.log( i +'===='+ firstTdObj.eq(i).width() );
                    totalTdWidth += firstTdObj.eq(i).width();
                }

                new_id_name_obj.prop('style','position: absolute;margin: 0;width:'+totalTdWidth+'px !important;');
                new_id_name_obj.width(totalTdWidth+'px');   //兼容360极速模式
            }

            //opt.leftNum = 0;

            //侧边浮动，则需要将当前的2张表拆分成4张
            if(opt.leftNum>0){
                var leftNum = opt.leftNum;

                // console.log(leftNum);

                copyLeftTable(trMainTable,leftNum,tr_left_table_id);
                //return;
                //主体左侧
                copyLeftTable(table,leftNum,main_left_table_id);
            }
            //debugger;
            //x轴产生滚动条时，顶部固定后，想左拖移，同步移动
            var scroll = function(event){
                var pageOffset      = GetPageScroll();      //当前页面上下左右偏移
                var pageLeftValue   = -pageOffset.x*1;      //页面向左偏移
                var tableLeftValue  = pageLeftValue+table_offset_left;

                // console.log( 'table_offset_left:'+table_offset_left +'=====pageLeftValue:'+ pageLeftValue +'=====tableLeftValue:'+ tableLeftValue );

                
                $("#"+tr_table_id).css({left:tableLeftValue});

                // console.log( pageOffset );
                // console.log( table.offset().top );

                if(opt.leftNum>0){
                    //4表拆分
                    //===============================
                    var trLeftTableCssObj   = {position:'absolute','z-index':'99'};
                    var mainLeftTableCssObj = {position:'absolute','z-index':'98'};
                    
                    //顶部浮动
                    if( pageOffset.y>=table_bottom_to_top ){        //进入表格底部
                        trLeftTableCssObj.top = table_bottom_to_top;
                    }else if( pageOffset.y>=table_offset_top ){     //顶部不进入隐藏区域
                        trLeftTableCssObj.top = pageOffset.y;
                    }else{                                          //表格中间
                        trLeftTableCssObj.top = tr_table_offset_top;
                    }
                    
                    //左侧浮动
                    if( tableLeftValue<=0 ){    //左边不进入隐藏区域
                        trLeftTableCssObj.left      = -pageLeftValue;
                        mainLeftTableCssObj.left    = -pageLeftValue;
                    }else{
                        trLeftTableCssObj.left      = table_offset_left;
                        mainLeftTableCssObj.left    = table_offset_left;
                    }

                    $("#"+tr_left_table_id).css( trLeftTableCssObj );
                    $("#"+main_left_table_id).css( mainLeftTableCssObj );
                }
                //===============================
            }
            $(window).scroll(function(event){
                scroll(event);
            })
            
            scroll();   //兼容360兼容模式

            

            //窗口大小改变
            $(window).resize(function() {
                var nextTable = restoreTable();
                setTimeout(function(){
                    //重新渲染表格
                    nextTable.pinTable(opt);
                },100);
                
            });
        } 
    });
})(jQuery);