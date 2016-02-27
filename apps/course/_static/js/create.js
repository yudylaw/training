var Course = {};   
/**
 * 获取课程数据
 */
function _getData(){
	var data = {};
	data.title = $("#course_name").val();//课程名
	data.subject = $("#course_subject").attr("code");
	data.required = $('#type input[name="type"]:checked ').val();
	data.description = $("#course_des").val();
	data.resourceids = $("#resource_ids").val();
	data.course_hour = $("#course_hour").val();//学时
	data.course_score = $("#course_score").val();//学分
	return data;
}
Course.init = function(){
	$("#create").click(function(){
		var coursedata = _getData();
		if(coursedata.title == ""){
			alert("课程标题不允许为空");
		}
		if(coursedata.subject == ""){
			alert("请选择学科");
		}
		if(coursedata.resourceids == "0"){
			var r=confirm("您还没上传资源，确认直接创建课程吗?")
			if(r != true)
			{
			    return;
			}
		}
		$.ajax({
			type: "POST",
			url: 'index.php?app=course&mod=Admin&act=ajaxCreate',
			data:coursedata,
			dataType: "json",
			async:false,
			success:function(msg){
				if(msg.status == 1){
					window.location.href="index.php?app=course&mod=Index&act=index";
				}
			},
			error:function(msg){
				alert("创建失败");
				return;
			}
		});
	});
}