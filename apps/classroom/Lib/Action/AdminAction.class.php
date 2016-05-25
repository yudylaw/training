<?php 

class AdminAction extends Action {
    
    private $types = array('单选题'=>1, '多选题'=>2, '简答题'=>3);
    
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
        $default_options['allow_exts'] = "xls,xlsx"; 					// 'jpg,gif,png,jpeg,bmp,zip,rar,doc,xls,ppt,docx,xlsx,pptx,pdf'
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
            $filepath = $default_options['save_path'].$data['save_name'];
            //生成试卷
            $this->createPaper($filepath);
            // 输出信息
            $return['status'] = true;
            $return['info']   = '{"status":1}';
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
        foreach($upload_info as $u) {
            $name = t($u['name']);
            $data['title'] = $name ? $name : $u['savename'];
            $data['utime'] = time();
            $data['ext'] = strtolower($u['extension']);
            $data['size'] = $u['size'];
            $data['save_path'] = $options['custom_path'];
            $data['save_name'] = $u['savename'];
            $data['status'] = 1;
        }
        return $data;
    }
    
    /**
     * 导入试卷模板,生成考试试卷
     */
    public function createPaper($filename) {
        // Check
        if (!file_exists($filename)) {
            exit("not found ".$filename);
        }
        
        /** PHPExcel_IOFactory */
        require_once ADDON_PATH . '/library/PHPExcel/IOFactory.php';
        
        $reader = PHPExcel_IOFactory::createReader('Excel5'); //设置以Excel5格式(Excel97-2003工作簿)
        $PHPExcel = $reader->load($filename); // 载入excel文件
        $sheet = $PHPExcel->getSheet(0); // 读取第一個工作表
        $highestRow = 39; // 取得总行数
        $highestColumm = 'H'; // 取得总列数
        
        $title = $sheet->getCell('A1')->getValue();//标题
        $totalScore = $sheet->getCell('H2')->getCalculatedValue();//总分,读表达式的值
        $passScore = $sheet->getCell('H3')->getValue();//及格分
        
        if(C('LOG_RECORD')) {
            if(empty($title)) {
                Log::write("试卷名称不能为空", Log::ERR);
                return;
            }
            if(!is_numeric($totalScore) || !is_numeric($passScore)) {
                Log::write($title.'--'.$totalScore. " AND " . $passScore . '必须同时为整数', Log::ERR);
                return;
            }
        }
        
        $uid = $this->mid;
        $actionTime = time();
        $paper = array("name"=>$title, "uid"=>$uid, "ctime"=>$actionTime, "type"=>0,
            "total_score"=>$totalScore, "pass_score"=>$passScore, "is_del"=>0);
        $hw_id = M('homework')->add($paper);
        
        if(C('LOG_RECORD')) {
            Log::write("创建作业:hw_id=$hw_id,name=".$paper['name'].json_encode($paper), Log::INFO);
        }
        
        $items = array();
        
        //读取试卷
        for ($row = 5; $row <= $highestRow; $row++){
            $type = $sheet->getCell('A'.$row)->getValue();//题型
            if (empty($type)) {
                continue;
            }
            $value = $this->types[$type];//题型编号
            if (!in_array($value, array(1,2,3))) {
                if(C('LOG_RECORD')) {
                    Log::write("无法导入的题型:" + $type, Log::WARN);
                }
                continue;
            }
            $qname = $sheet->getCell('B'.$row)->getValue();
            $answer = $sheet->getCell('G'.$row)->getValue();//答案，简答题答案为空
            $score = $sheet->getCell('H'.$row)->getValue();
            
            if(C('LOG_RECORD')) {
                if(empty($qname)) {
                    Log::write($title . "--的题目不能为空:" + $type, Log::WARN);
                    continue;
                }
                if(!is_numeric($score)) {
                    Log::write($qname.'--的分数'.$score.'必须为整数', Log::ERR);
                    continue;
                }
            }
            
            $question = array('hw_id'=>$hw_id, 'type'=>$value, 'name'=>$qname, 
                'score'=>$score, 'num'=>$row - 4, 'is_del'=>0);
            
            if (!empty($answer)) {
                $answer = implode(',', str_split($answer));
                $question['answer'] = $answer;
            }
            //type:单选题, 多选题, 简单题
            //简单题只有标题，没用答案，需要老师批改
            if (in_array($type, array('单选题', '多选题'))) {
                if(C('LOG_RECORD')){
                    if (empty($answer)) {
                        Log::write($qname.'--单选题、多选题的答案不能为空', Log::ERR);
                        continue;
                    }
                }
                $a_option = $sheet->getCell('C'.$row)->getValue();
                if (!empty($a_option)) {
                    $question['a_option'] = $a_option;
                }
                $b_option = $sheet->getCell('D'.$row)->getValue();
                if (!empty($b_option)) {
                    $question['b_option'] = $b_option;
                }
                $c_option = $sheet->getCell('E'.$row)->getValue();
                if (!empty($c_option)) {
                    $question['c_option'] = $c_option;
                }
                $d_option = $sheet->getCell('F'.$row)->getValue();
                if (!empty($d_option)) {
                    $question['d_option'] = $d_option;
                }
            }
            $qid = M('homework_question')->add($question);
            if(C('LOG_RECORD')) {
                Log::write("创建试题:qid=$qid,name=".$question['name'].json_encode($question), Log::INFO);
            }
        }
    }
    
    public function delete() {
        $weiba_id = intval($_REQUEST['class_id']);
        M('weiba')->save(array('weiba_id'=>$weiba_id, 'is_del'=>1));
        $this->ajaxReturn(null, "删除成功");
    }
    
    public function classroom_list() {
        //参数 p=currentPage
        $pageSize = 20;
        $result = M("weiba")->where(array('is_del'=>0, 'weiba_id'=>array("GT", 1)))->order('weiba_id desc')->findPage($pageSize);
    
        $adminIds = array();
    
        $classroomList = $result['data'];
        
        foreach ($classroomList as $classroom) {
            array_push($adminIds, $classroom['admin_uid']);
        }
        
        $users = M('user')->where(array('uid'=>array('IN', $adminIds), 'is_del'=>0))->findAll();
        
        foreach ($classroomList as &$classroom) {
            foreach ($users as $user) {
                if ($classroom['admin_uid'] == $user['uid']) {
                    $classroom['uname'] = $user['uname'];
                }
            }
        }
        
        $this->assign("classroomList", $classroomList);
        $this->assign("page", $result['html']);
        $this->display();
    }
    
    public function member_list() {
        $class_id = intval($_REQUEST['class_id']);
        $classroom = M('weiba')->where(array('weiba_id'=>$class_id, 'is_del'=>0))->find();
        
        if(empty($classroom)) {
            $this->error("班级不存在");
        }
        
        $sql = "SELECT wf.*, u.uname, u.location, u.phone, u.sex from ts_weiba_follow wf LEFT JOIN ts_user u ON wf.follower_uid = u.uid";
        $sql .=" WHERE wf.weiba_id = ".$class_id;
        $members = M('weiba_follow')->query($sql);
        
        $this->assign('classroom', $classroom);
        $this->assign('members', $members);
        $this->display();
    }
    
    public function create() {
        $this->display();
    }
    
    public function batch() {
        
        $myfile = fopen(SITE_PATH."/user_shuxue.log", "r") or die("Unable to open file!");
        
        while($line = fgets($myfile)) {
            $line = trim($line);
            $values = explode(" ", $line);
            $name = $values[0];
            $region = intval($values[1]);
            $phone = $values[3];
            $class_id = intval(trim($values[4]));
            $gender = 1;
        
            if (empty($name)) {
                Log::write("姓名不能为空 $phone", Log::ERR);
                continue;
            }
            
            if (empty($phone)) {
                Log::write("手机号码不能为空 $name", Log::ERR);
                continue;
            }
            
            if (!preg_match("/^1[0-9]{2}[0-9]{8}$/", $phone)) {
                Log::write("手机号码格式不对 $name $phone", Log::ERR);
                continue;
            }
            
            $area = M('area')->where(array('area_id'=>$region))->find();
            
            if (empty($area)) {
                Log::write("所属学校不存在 $name $phone", Log::ERR);
                continue;
            }
            
            $classroom = M('weiba')->where(array('weiba_id'=>$class_id, 'is_del'=>0))->find();
            
            if (empty($classroom)) {
                Log::write("班级不存在 $name $phone", Log::ERR);
                continue;
            }
            
            $user = M('user')->where(array('phone'=>$phone))->find();
            
            $uid = - 1;
            $tips = "添加成功";
            if (empty($user)) {
                //添加用户
                $setuser = array('uname'=>$name, 'phone'=>$phone,
                    'sex'=>$gender, 'ctime'=>time(),
                    'is_audit'=>1, 'is_active'=>1, 'is_init'=>1, 'identity'=>1,
                    'area'=>0, 'province'=>3308, 'city'=>$region,
                    'location'=>$area['title']);
                
                $setuser['invite_code'] = 'batch_add';//批量添加标志
                //初始化密码
                $setuser['login_salt'] = rand(10000, 99999);
                $setuser['password'] = md5(md5("12345678").$setuser['login_salt']);//密码默认是12345678
                //保存
                $uid = M('user')->add($setuser);
            } else {
                $uid = $user['uid'];
                $group = M('user_group_link')->where(array('uid'=>$uid, 'user_group_id'=>Role::SUPER_ADMIN))->findAll();
                if (!empty($group)) {
                    Log::write("该用户是管理员角色，无法加入班级 $name $phone", Log::ERR);
                    continue;
                }
                $tips = "该用户已经存在，加入班级成功";
            }
            
            if ($uid < 1) {
                Log::write("保存用户信息失败 $name $phone", Log::ERR);
                continue;
            } else {
                $follower = M('weiba_follow')->where(array('weiba_id'=>$class_id, 'follower_uid'=>$uid))->find();
                if (!empty($follower)) {
                    Log::write("用户已经加入该班级，无法重复加入 $name $phone", Log::ERR);
                    continue;
                }
            }
            
            $data = array('weiba_id'=>$class_id, 'follower_uid'=>$uid, 'level'=>1);
            M('weiba_follow')->add($data);
            
            //添加组
            $group_link = array('uid'=>$uid, 'user_group_id'=>Role::TEACHER);
            M('user_group_link')->add($group_link);
            
            $follower_count = $classroom['follower_count'] + 1;
            //更新成员计数
            M('weiba')->where(array('weiba_id'=>$classroom['weiba_id']))->save(array('follower_count'=>$follower_count));
            
            Log::write("添加成功, $name $phone", Log::INFO);
        }
        fclose($myfile);
    }
    
    public function addMember() {
        $class_id = intval($_REQUEST['class_id']);
        $name = $_REQUEST['name'];
        $phone = $_REQUEST['phone'];
        $gender = intval($_REQUEST['gender']);
        $region = intval($_REQUEST['region']);
        $role = intval($_REQUEST['role']);
        
        if (empty($name)) {
            $this->ajaxReturn(null, "姓名不能为空", -1);
        }
        
        if (empty($phone)) {
            $this->ajaxReturn(null, "手机号码不能为空", -1);
        }
        
        if (!preg_match("/^1[0-9]{2}[0-9]{8}$/", $phone)) {
            $this->ajaxReturn(null, "手机号码格式不对", -1);
        }
        
        $area = M('area')->where(array('area_id'=>$region))->find();
        
        if (empty($area)) {
            $this->ajaxReturn(null, "所属学校不存在", -1);
        }
        
        if (!ClassroomRole::hasRole($role)) {//1:成员，3：班级管理员
            $this->ajaxReturn(null, "角色不存在", -1);
        }
        
        $classroom = M('weiba')->where(array('weiba_id'=>$class_id, 'is_del'=>0))->find();
        
        if (empty($classroom)) {
            $this->ajaxReturn(null, "班级不存在", -1);
        }
        
        if ($classroom['admin_uid'] > 0 && $role == ClassroomRole::CLASSROOM_ADMIN) {
            $this->ajaxReturn(null, "该班级已经存在管理员", -1);
        }
        
        $user = M('user')->where(array('phone'=>$phone))->find();
        
        $uid = - 1;
        $tips = "添加成功";
        if (empty($user)) {
            //添加用户
            $setuser = array('uname'=>$name, 'phone'=>$phone, 
                'sex'=>$gender, 'ctime'=>time(), 
                'is_audit'=>1, 'is_active'=>1, 'is_init'=>1, 'identity'=>1, 
                'area'=>0, 'province'=>3308, 'city'=>$region,
                'location'=>$area['title']);
            //初始化密码
            $setuser['login_salt'] = rand(10000, 99999);
            $setuser['password'] = md5(md5("12345678").$setuser['login_salt']);//密码默认是12345678
            //保存
            $uid = M('user')->add($setuser);
        } else {
            $uid = $user['uid'];
            $group = M('user_group_link')->where(array('uid'=>$uid, 'user_group_id'=>Role::SUPER_ADMIN))->findAll();
            if (!empty($group)) {
                $this->ajaxReturn(null, "该用户是管理员角色，无法加入班级", -1);
            }
            $tips = "该用户已经存在，加入班级成功";
        }
        
        if ($uid < 1) {
            $this->ajaxReturn(null, "保存用户信息失败", -1);
        } else {
            $follower = M('weiba_follow')->where(array('weiba_id'=>$class_id, 'follower_uid'=>$uid))->find();
            if (!empty($follower)) {
                $this->ajaxReturn(null, "用户已经加入该班级，无法重复加入", -1);
            }
        }
        
        $data = array('weiba_id'=>$class_id, 'follower_uid'=>$uid, 'level'=>$role);
        M('weiba_follow')->add($data);
        
        $group_link = M('user_group_link')->where(array('uid'=>$uid))->find();
        
        $group = ClassroomRole::getUserGroup($role);
        
        if (empty($group_link)) {
            //添加组
            $group_link = array('uid'=>$uid, 'user_group_id'=>$group);
            M('user_group_link')->add($group_link);
        } else {
            //更新组
            if ($group_link['user_group_id'] < $group) { //TODO 仅区分教师，班级管理员
                $group_link = array('user_group_id'=>$group);
                M('user_group_link')->where(array('uid'=>$uid))->save($group_link);
            }
        }
        
        $adminUid = 0; //默认 0
        
        if ($role == ClassroomRole::CLASSROOM_ADMIN) {
            $adminUid = $uid;
        }
        
        $follower_count = $classroom['follower_count'] + 1;
        //更新成员计数
        M('weiba')->where(array('weiba_id'=>$classroom['weiba_id']))->save(array('follower_count'=>$follower_count, 'admin_uid'=>$adminUid));
        
        $this->ajaxReturn(null, $tips);
        
    }
    
    public function deleteMember() {
        $class_id = intval($_REQUEST['class_id']);
        $uid = intval($_REQUEST['uid']);
        
        $classroom = M('weiba')->where(array('weiba_id'=>$class_id, 'is_del'=>0))->find();
        
        if (empty($classroom)) {
            $this->ajaxReturn(null, "班级不存在", -1);
        }
        
        $follower = M('weiba_follow')->where(array('weiba_id'=>$class_id, 'follower_uid'=>$uid))->find();
        
        if (empty($follower)) {
            $this->ajaxReturn(null, "成员不存在");
        }
        
        $row = M('weiba_follow')->where(array('weiba_id'=>$class_id, 'follower_uid'=>$uid))->delete();
        if ($row > 0) {
            $follower_count = $classroom['follower_count'] - 1;
            $follower_count = $follower_count < 0 ? 0 : $follower_count;
            $data = array('follower_count'=>$follower_count);
            
            if ($classroom['admin_uid'] == $uid) {
                $data['admin_uid'] = 0; //删除管理员
            }
            //更新成员计数
            M('weiba')->where(array('weiba_id'=>$classroom['weiba_id']))->save($data);
        }
        $this->ajaxReturn(null, "删除成功");
    }
    
    public function add_member() {
        $class_id = intval($_REQUEST['class_id']);
        $classroom = M('weiba')->where(array('weiba_id'=>$class_id, 'is_del'=>0))->find();
        
        if(empty($classroom)) {
            $this->error("班级不存在");
        }
        
        $regions = M('area')->query("select * from ts_area where pid > 0");
        
        $this->assign('classroom', $classroom);
        $this->assign('regions', $regions);
        $this->display();
    }
    
    public function add() {
        $name = $_REQUEST['name'];
        $subject = intval($_REQUEST['subject']);
        
        global $ts;
        
        if(empty($ts['_subjects'][$subject])) {
            $this->ajaxReturn(null, "学科不存在", -1);
        }
        
        if (empty($name)) {
            $this->ajaxReturn(null, "班级名称不能为空", -1);
        }
        
        //cid = subject 分类
        $data = array('weiba_name'=>$name, 'uid'=>$this->mid, 'cid'=>$subject, 'status'=>1, 'ctime'=>time());
        
        M('weiba')->add($data);
        $this->ajaxReturn(null, "创建成功");
    }
    /**
     * 编辑班级成员
     */
    public function edit_member() {
        $class_id = intval($_REQUEST['class_id']);
        $mid = intval($_REQUEST['mid']);
        if(empty($class_id)){
            $this->error("班级id不能为空");
        }
        
        if(empty($mid)){
            $this->error("用户id不能为空");
        }
        
        $classroom = M('weiba')->where(array('weiba_id'=>$class_id, 'is_del'=>0))->find();
    
        if(empty($classroom)) {
            $this->error("班级不存在");
        }
        $follower = M('weiba_follow')->where(array('weiba_id'=>$class_id))->field('follower_uid')->findAll();
        $follower = getSubByKey($follower,'follower_uid');
        if(!in_array($mid,$follower)){
            $this->error("该用户不属于此班级");
        }
        $regions = M('area')->query("select * from ts_area where pid > 0");
        $edit_user = M('user')->where(array('uid'=>$mid))->find();
        $this->assign('classroom', $classroom);
        $this->assign('regions', $regions);
        $this->assign("edit_user",$edit_user);
        $this->display();
    }
    
    public function editMember() {
        $class_id = intval($_REQUEST['class_id']);
        $name = $_REQUEST['name'];
        $phone = $_REQUEST['phone'];
        $gender = intval($_REQUEST['gender']);
        $region = intval($_REQUEST['region']);
        $uid = intval($_REQUEST['uid']);
        if (empty($name)) {
            $this->ajaxReturn(null, "姓名不能为空", -1);
        }
    
        if (empty($phone)) {
            $this->ajaxReturn(null, "手机号码不能为空", -1);
        }
    
        if (!preg_match("/^1[0-9]{2}[0-9]{8}$/", $phone)) {
            $this->ajaxReturn(null, "手机号码格式不对", -1);
        }
        
        $phone_user = M('user')->where(array('phone'=>$phone))->field('uid')->find();
        
        if($phone_user['uid'] != $uid){//手机号查出的用户不是该用户,则表示此号已被注册
            $this->ajaxReturn(null, "该手机号已经被注册", -1);
        }
        
        $area = M('area')->where(array('area_id'=>$region))->find();
    
        if (empty($area)) {
            $this->ajaxReturn(null, "所属学校不存在", -1);
        }
        
        $follower = M('weiba_follow')->where(array('weiba_id'=>$class_id))->field('follower_uid')->findAll();
        $follower = getSubByKey($follower,'follower_uid');
        if(!in_array($uid,$follower)){
            $this->ajaxReturn(null, "该用户不属于此班级", -1);
        }
        $setuser = array('uname'=>$name, 'phone'=>$phone,'city'=>$region,'sex'=>$gender,'location'=>$area['title']);
    
        $result = M('user')->where(array('uid'=>$uid))->save($setuser);
        if($result){
            $this->ajaxReturn(null, "保存成功");
        }else{
            $this->ajaxReturn(null,"保存失败",-1);
        }
    
    }
    
}