<?php 
/**
 * 创建课程
 * @author sjzhao
 *
 */
// 加载上传操作类
require_once SITE_PATH.'/addons/library/UploadFile.class.php';
class AdminAction extends Action {
    
    public function test() {
        //         $filepath = $default_options['save_path'].$data['save_name'];
        $filepath = "/home/yudylaw/yudy/share/user.txt";
        $url = putObjectByFile($filepath);
        Log::write($url, Log::INFO);
        echo $url;
    }
    
    /**
     * 创建课程学习
     */
    public function create(){
        $subject = C('subjects');
        $subjects = array();
        foreach ($subject as $key=>$val){
            $subjects[$key]['code'] = $key;
            $subjects[$key]['name'] = $val;
        }
        $this->assign("subject",$subjects);
        $this->display();
    }    
    /**
     * 编辑课程学习
     */
    public function edit(){
        $id = $_REQUEST['id'];
        if(empty($id)){
            $this->error("课程id不能为空");
        }
        $course = model('Course')->where(array('id'=>$id,'is_del'=>0))->find();
        $subject = C('subjects');
        $subjects = array();
        foreach ($subject as $key=>$val){
            $subjects[$key]['code'] = $key;
            $subjects[$key]['name'] = $val;
        }
        $this->assign("subject",$subjects);
        $course['subjectname'] = $subjects[$course['subject']]['name'];
        $this->assign("course",$course);
        $this->display();
    }
    
    public function upload() {
        //调用本地上传
        $this->localUpload(array());
    }
    /**
     * 上传方法
     * @param array $options
     */
    private function localUpload($options,$input_options=null){
        
        $system_default = model('Xdata')->get('admin_Config:attach');
        if(empty($system_default['attach_path_rule']) || empty($system_default['attach_max_size']) || empty($system_default['attach_allow_extension'])) {
            $system_default['attach_path_rule'] = 'Y/md/H/';
            $system_default['attach_max_size'] = '100'; 		// 默认100M
            $system_default['attach_allow_extension'] = 'flv';
            model('Xdata')->put('admin_Config:attach', $system_default);
        }
        // 载入默认规则
        $default_options = array();
        $default_options['custom_path']	= date($system_default['attach_path_rule']);					// 应用定义的上传目录规则：'Y/md/H/'
        $default_options['max_size'] = floatval($system_default['attach_max_size']) * 1024 * 1024;		// 单位: 兆
        $default_options['allow_exts'] = "flv,xls,xlsx,ppt,pptx"; 					// 'jpg,gif,png,jpeg,bmp,zip,rar,doc,xls,ppt,docx,xlsx,pptx,pdf'
        $default_options['save_path'] =	UPLOAD_PATH.'/'.$default_options['custom_path'];
        $default_options['save_name'] =	''; //指定保存的附件名.默认系统自动生成
        $default_options['save_to_db'] = true;
        // 定制化设这，覆盖默认设置
        $options = is_array($input_options) ? array_merge($default_options,$input_options) : $default_options;
        // 初始化上传参数
        $upload	= new UploadFile($options['max_size'], $options['allow_exts'], array());
        // 设置上传路径
        $upload->savePath = $options['save_path'];
        // 启用子目录
        $upload->autoSub = false;
        // 保存的名字
        $upload->saveName = $options['save_name'];
        // 默认文件名规则
        $upload->saveRule = $options['save_rule'];
        // 是否缩略图
        if ($options['auto_thumb'] == 1) {
            $upload->thumb = true;
        }
    
        // 创建目录
        mkdir($upload->save_path, 0777, true);
    
        // 执行上传操作
        if(!$upload->upload()) {
            // 上传失败，返回错误
            $return['status'] = false;
            $return['info']	= $upload->getErrorMsg();
            return $return;
        } else {
            $upload_info = $upload->getUploadFileInfo();
            // 保存信息到附件表
            $data = $this->saveInfo($upload_info, $options);
            // 输出信息
            $return['status'] = true;
            $return['info']   = $data;
            // 上传成功，返回信息
            return $return;
        }
    }
    /**
     * 保存上传信息
     * @param array $upload_info
     * @param array $options
     */
    private function saveInfo($upload_info,$options){
        if($options['save_to_db']) {
            foreach($upload_info as $u) {
                $name = t($u['name']);
                $data['title'] = $name ? $name : $u['savename'];
                $data['utime'] = time();
                $data['ext'] = strtolower($u['extension']);
                $data['size'] = $u['size'];
                $data['save_path'] = $options['custom_path'];
                $data['save_name'] = $u['savename'];
                $resource_id = model('CourseResource')->add($data);//保存到课程资源
                $data['resource_id'] = $resource_id;//上传成功返回的id,根据此id更新数据库course_id字段,表示此资源属于哪个课程
                if($resource_id){
                    $data['status'] = 1;
                }
            }
        } else {//暂不使用
            foreach($upload_info as $u) {
                $name = t($u['name']);
                $data['name'] = $name ? $name : $u['savename'];
                $data['type'] = $u['type'];
                $data['size'] = byte_format($u['size']);
                $data['extension'] = strtolower($u['extension']);
                $data['hash'] = $u['hash'];
                $data['save_path'] = $options['custom_path'];
                $data['save_name'] = $u['savename'];
                //$data['save_domain'] = C('ATTACH_SAVE_DOMAIN'); 	//如果做分布式存储，需要写方法来分配附件的服务器domain
                $data['key'] = $u['key'];
            }
        }
        echo json_encode($data);
    }
    /**
     * 创建课程
     */
    public function ajaxCreate(){
        $data = array();
        $data['title'] = t($_REQUEST['title']);
        $data['creator'] = $this->uid;
        $data['subject'] = t($_REQUEST['subject']);//学科
        $data['required'] = t($_REQUEST['required']);//必修与选修
        $data['course_hour'] = t($_REQUEST['course_hour']);//学时
        $data['course_score'] = t($_REQUEST['course_score']);//学分
        $data['description'] = t($_REQUEST['description']);//描述
        $data['ctime'] = time();
        //$resourceids = t($_REQUEST['resourceids']);
        $result = Model('Course')->addCourse($data);
        if($result){
            //将上传资源归属到对应的课程
            /* $resourceids = explode(",",$resourceids);
            $courseids['course_id'] = $result;
            $map['id'] = array('IN',$resourceids);
            model('CourseResource')->where($map)->save($courseids); */
            echo '{"status":1,"msg":"创建成功"}';
        }else{
            echo '{"status":0,"msg":"创建失败"}';
        }
    }
    
    /**
     * 编辑课程
     */
    public function ajaxSave(){
        $data = array();
        $id = $_POST['id'];
        $data['title'] = t($_REQUEST['title']);
        //$data['creator'] = $this->uid;
        $data['subject'] = t($_REQUEST['subject']);//学科
        $data['required'] = t($_REQUEST['required']);//必修与选修
        $data['course_hour'] = t($_REQUEST['course_hour']);//学时
        $data['course_score'] = t($_REQUEST['course_score']);//学分
        $data['description'] = t($_REQUEST['description']);//描述
        $data['update_date'] = time();
        $result = Model('Course')->where(array('id'=>$id))->save($data);
        if($result){
            echo '{"status":1,"msg":"保存成功"}';
        }else{
            echo '{"status":0,"msg":"保存失败"}';
        }
    }
    /**
     * 验证验证码
     */
    public function verify() {
        //检查验证码
        if (md5(strtoupper($_POST['verify'])) != $_SESSION['verify']) {
            $data['status'] = 0;
            $data['msg'] = '验证码错误';
        }else {
            $data['status'] = 1;
            $data['msg'] = '通过验证';
            unset($_SESSION['verify']);
            session_destroy($_SESSION['verify']);
        }
        echo json_encode($data);
    }
    /**
     * 保存视频进度,同时更新课程学习进度
     */
    public function saveProgress(){
        $resid = $_REQUEST['resource_id'];//资源id
        $duration = $_REQUEST['duration'];//视频总进度
        $time = $_REQUEST['time'];//播放进度
        $data['class_id'] = $this->user['class_id'];
        $data['uid'] = $this->uid;
        $data['percent'] =  round(($time / $duration) * 100) > 100 ? 100 : round(($time / $duration) * 100);
        $data['resourceid'] = $resid;
        $res = model('CourseResourceLearning')->addResLearning($data);
        echo json_encode($res);
    }
    /**
     * 将资源归属到课程
     */
    public function saveResToCourse(){
        $courseids['course_id'] = intval($_POST['courseid']);
        $map['id'] = intval($_POST['resid']);
        $res = model('CourseResource')->where($map)->save($courseids);
        if($res){
            echo '{"status":1,"msg":"资源上传成功"}';
        }else{
            echo '{"status":0,"msg":"资源保存失败"}';
        }
    }
    /**
     * 查看学习记录
     */
    public function learnlist(){
        $id = $_REQUEST['cid'];//课程id
        if(empty($id)){
            $this->error("课程id不能为空");
        }
        //普通教师预览课程资源学习记录
        if($this->user['group_id'] == Role::TEACHER){
            $result = model("CourseResourceLearning")->getLearningList(array('course_id'=>$id,'uid'=>$this->uid));
            $data = $result['data'];
            $course = model('Course')->where(array('id'=>$id))->select();
            //$usermodel = model('User');
            foreach ($data as &$val){
                //$user = $usermodel->getUserInfo($val['uid']);
                //$val['uname'] = $user['uname'];
                //$val['location'] = $user['location'];
                //$val['phone'] = $user['phone'];
                $resource = model('CourseResource')->getResourceById($val['resourceid']);
                $resource = $resource[0];
                $val['restitle'] = $resource['title'];//资源名称
            }
            $totalRows = $result['totalRows'];
            $p = new Page($totalRows,20);
            $page = $p->show();
            $this->courselearning = $data;
            $this->course = $course[0];
            $this->page = $page;
            $this->display();
        }else{//管理员查看所有课程学习记录
            $result = model("CourseLearning")->getCourseLearningByCondition(array('course_id'=>$id));
            $course = model('Course')->where(array('id'=>$id))->find();
            $data = $result['data'];
            $usermodel = model('User');
            $coursemodel = model('Course');
            foreach ($data as &$val){
                $user = $usermodel->getUserInfo($val['uid']);
                $val['uname'] = $user['uname'];
                $val['location'] = $user['location'];
                $val['phone'] = $user['phone'];
                $course = $coursemodel->where(array('id'=>$val['course_id']))->select();
                $course = $course[0];
                $val['coutitle'] = $course['title'];//课程名称
            }
            $this->courselearning = $data;
            $totalRows = $result['totalRows'];
            $p = new Page($totalRows,20);
            $page = $p->show();
            $this->page = $page;
            $this->assign("course",$course);
            $this->display("learnlist_admin");
        }
         
    }
    /**
     * 开始或者结束课程
     * @param unknown $param
     */
    public function startandend() {
        $type = $_POST['type'];
        $id = $_POST['course_id'];
        if($type == 'start'){
            $start_date = time();
            $res = model('Course')->updateCourse(array('id'=>$id,'status'=>1));
        }else{
            $end_date = time();
            $res = model('Course')->updateCourse(array('id'=>$id,'status'=>0));
        }
        if($res){
            echo '{"status":1,"msg":"操作成功"}';
        }else{
            echo '{"status":0,"msg":"操作失败"}';
        }
    }
    /**
     * 管理员预览课程页面
     */
    public function preview(){
        
    }
    /**
     * 删除课程
     */
    public function  delCourse(){
       $id = $_POST['course_id']; //课程id
       $map['id'] = $id;
       $res = model('Course')->where($map)->save(array('is_del'=>1));
       //删除课程则删除所有课程学习记录以及课程资源学习记录
       model('CourseLearning')->where(array('course_id'=>$id))->delete();
       $totalresources = model('CourseResource')->where(array('course_id'=>$id,'is_del'=>0))->findAll();
       $resids = array();
       foreach ($totalresources as $val) {
           array_push($resids, $val['id']);
       }
       $con['resourceid'] = array('IN',$resids);
       model('CourseResourceLearning')->where($con)->delete();//删除课程中所有资源学习记录
       if($res){
           echo '{"status":1,"msg":"操作成功"}';
       }else{
           echo '{"status":0,"msg":"操作失败"}';
       }
    }
    /**
     * 删除资源
     */
    public function delResource() {
        $res_id = $_POST['resid'];
        $map['id'] = $res_id;
        $courseresource = model('CourseResource');
        $res = $courseresource->where($map)->save(array('is_del'=>1));
        //删除资源需要删除关于此资源的学习记录，并同时更新此资源所属课程的学习记录,资源记录为真删除
        //删除所有此资源的学习记录
        $map2['resourceid'] = $res_id;
        //删除之前,记录原来学习记录
        $courseresourcelearning = model('CourseResourceLearning');
        $learn_record = $courseresourcelearning->where($map2)->findAll();
        //删除
        $courseresourcelearning->where($map2)->delete();
        
        //查出资源所属的课程id
        $cid = $courseresource->where($map)->getField('course_id');
        //统计该课程所有未删除资源数
        $totalresources = $courseresource->where(array('course_id'=>$cid,'is_del'=>0))->findAll();
        $totalnum = count($totalresources);
        $resids = array();
        foreach ($totalresources as $val) {
            array_push($resids, $val['id']);
        }
        
        $courseLearning = model('CourseLearning');
        
        foreach ($learn_record as $lr){
            // 该课程中已完成的资源数量
            $maps['uid'] = $lr['uid'];
            $maps['percent'] = 100;
            //! empty($param['class_id']) && $maps['classid'] = $param['class_id'];
            $maps['resourceid'] = array("IN",$resids);
            $finishednum = $courseresourcelearning->where($maps)->count();
            
            if($finishednum == 0){//此资源删除之后，该用户不存在已完成学习资源，则删除课程学习记录,表示课程已有资源没有一个完成学习
                $courseLearning->where(array('uid'=>$lr['uid'],'course_id'=>$cid))->delete();
            }else{
                $percent = round(($finishednum / $totalnum) * 100);
                $courseLearning->addCourseLearning(array('uid'=>$lr['uid'],'course_id'=>$cid,'percent'=>$percent));
            }
        }
        //更新所有关于此资源的课程学习记录
        if($res){
            echo '{"status":1,"msg":"操作成功"}';
        }else{
            echo '{"status":0,"msg":"操作失败"}';
        }
    }
    
    //腾讯视频上传
    public function go_upload() {
        $course_id = $_GET['cid'];//课程id
        $status = model('Course')->where(array('id'=>$course_id))->getField("status");
        if($status == 1){
            $this->error("课程已开始,不允许继续上传资源");
        }
        $secretId = C('SECRET_ID');
        $this->assign("secretId", $secretId);
        $this->assign("course_id", $course_id);
        $this->display("upload_new");
    }
    
    //签名
    public function signature() {
        $argStr = $_REQUEST["args"];
        // 	    $action = $_REQUEST["Action"];//MultipartUploadVodFile
         
        if (empty($argStr)) {
            $this->ajaxReturn(null, "bad request", -1);
        }
         
        // 	    if ("MultipartUploadVodFile" != $action) {
        // 	        $this->ajaxReturn(null, "bad request", -1);
        // 	    }
         
        $secretKey = C('SECRET_KEY');
        $sha = base64_encode(hash_hmac('sha1', $argStr, $secretKey, true));
        $this->ajaxReturn(null, $sha);
    }
    
    //腾讯视频转码成功后的回调
    public function t_callback() {
        $data = $_REQUEST;
        if($data['task'] == "transcode"){//转码完成,转换状态置为1
            model("CourseResource")->where(array('video_id'=>$data['vid']))->save(array('trans_status'=>1));
        }
        foreach ($data as $key=>$value) {
            Log::write($key.'<=>'.$value, Log::INFO);
        }
    }
    /**
     * 将上传到腾讯视频云的资源信息保存到本地
     */
    public function saveResToLocal(){
        $data['title'] = t($_POST['name']);
        $data['utime'] = time();
        $data['ext'] = 'flv';
        $data['size'] = $_POST['size'];
        $data['course_id'] = $_POST['course_id'];
        $data['video_id'] = $_POST['id'];
        $resource_id = model('CourseResource')->add($data);//保存到课程资源
        if($resource_id){
            echo '{"status":1,"msg":"上传成功"}';
        }else{
            echo '{"status":0,"msg":"上传失败"}';
        }
    }
    /**
     * 修改资源名称
     */
    public function editResName() {
        $resname = $_POST['resname'];
        $id = $_POST['id'];
        $res = model('CourseResource')->where(array('id'=>$id))->save(array('title'=>t($resname)));
        if($res){
            echo '{"status":1,"msg":"修改成功"}';
        }else{
            echo '{"status":0,"msg":"修改失败"}';
        }
    }
    /**
     * 获取班级列表
     */
    public function list_class() {
        $course_id = $_POST['cid'];//班级id
        $classes = D('Weiba','weiba')->where(array('is_del'=>0))->findAll();
        foreach ($classes as &$val){
            if(D('CourseAssign')->where(array('classid'=>$val['weiba_id'],'courseid'=>$course_id))->count() > 0){
                $val['is_assign'] = 1;//已分配
            }else{
                $val['is_assign'] = 0;
            }
        }
        $this->assign("classes",$classes);
        $this->display();
    }
    /**
     * ajax课程安排
     */
    public function assignCourse(){
        $course_id = intval($_GET['cid']);
        $class_ids = $_GET['class_ids'];
        $courseassign = D('CourseAssign');
        $class_id = intval($class_ids);
        //判断是否已安排
        if($courseassign->where(array('classid'=>$class_id,'courseid'=>$course_id))->count() == 0){
            $courseassign->add(array('classid'=>$class_id,'courseid'=>$course_id,'ctime'=>time()));
            //获取该班级所有的人员同时产生课程记录
            $users_inclass =  D('Weiba')->table ( "ts_weiba_follow" )->where(array('weiba_id'=>$class_id))->findAll();
            $courselearning = D('CourseLearning');
            foreach ($users_inclass as $val){
                if ($val['level'] == 1) { //成员
                    $courselearning->add(array('class_id'=>$class_id,'uid'=>$val['follower_uid'],'course_id'=>$course_id,'ctime'=>time()));
                }
            }
            $this->ajaxReturn(null, '安排成功',1);
        }else{
            $this->ajaxReturn(null, '不能重复安排!',0);
        }
   
    }
    /**
     * 安排课程
     * @author sjzhao
     */
    public function assign_course() {
        $cid = $_REQUEST['cid'];
        if(empty($cid)){
            $this->error("课程id不能为空");
        }
        //最近20个班级
        $classes = M('weiba')->query("SELECT weiba_id, weiba_name, ctime FROM ts_weiba WHERE is_del=0 ORDER BY ctime desc limit 0,20");
        $this->assign("classes",$classes);
        $assigns = D('CourseAssign')->where(array('is_del'=>0,'courseid'=>$cid))->order('ctime desc')->findPage(20);
        $this->assign('cid',$cid);
        $data = $assigns['data'];
        $course = D('Course');
        $current_course = $course->where(array('id'=>$cid))->find();
        $this->assign("current_course",$current_course);
        $weiba = D('Weiba','weiba');
        foreach ($data as &$val){
            $val['name'] = $course->where(array('id'=>$val['courseid']))->getField('title');
            $val['class_name'] = $weiba->where(array('weiba_id'=>$val['classid']))->getField('weiba_name');
        }
        $totalRows = $assigns['totalRows'];
        $this->assign("assigns",$data);
        $p = new Page($totalRows,20);
        $page = $p->show();
        $this->page = $page;
        $this->display();
    }
    /**
     * 删除课程安排
     */
    public function delAssign() {
        $sid = $_GET['sid'];
        $assgin = model('CourseAssign')->where(array('id'=>$sid))->find();
        $weiba_id = $assgin['classid'];//分配的班级id
        $course_id = $assgin['courseid'];//分配的课程id
        $conditon['class_id'] = $weiba_id;
        $conditon['course_id'] = $course_id;
        $conditon['percent'] = array('gt',0);
        if(model('CourseLearning')->where($conditon)->count() > 0){
            echo json_encode(array("status"=>0,"msg"=>"该课程已存在学习记录,禁止删除!"));
        }else{
            $users_inclass =  D('Weiba')->table ( "ts_weiba_follow" )->where(array('weiba_id'=>$weiba_id))->findAll();//查询该班级所有的人
            //查询该课程包含哪些资源,这些资源的学习记录全部需要删除掉
            $resource_ids = array();
            $resources = model('CourseResource')->where(array('course_id'=>$course_id))->findAll();
            foreach ($resources as $val){
                array_push($resource_ids,$val['id']);
            }
            $result = model('CourseAssign')->where(array('id'=>$sid))->save(array('is_del'=>1));//删除安排表记录
            if($result){
                //删除所有该课程学习记录
                foreach ($users_inclass as $val){
                    //删除所有的课程学习记录
                    $uid = $val['follower_uid'];
                    $map['class_id'] = $weiba_id;
                    $map['uid'] = $uid;
                    $map['course_id'] = $assgin['courseid'];
                    $result2 = model('CourseLearning')->where($map)->save(array('is_del'=>1));
                    //同时删除所有该课程的资源学习记录
                    $map2['classid'] = $weiba_id;
                    $map2['uid'] = $uid;
                    $map2['resourceid'] = array('IN',$resource_ids);
                    $result3= model('CourseResourceLearning')->where($map2)->save(array('is_del'=>1));
                }
                echo json_encode(array("status"=>1,"msg"=>"删除成功"));
            }else{
                echo json_encode(array("status"=>1,"msg"=>"删除失败"));
            }
        }
        
    }
    
}