<?php 

class HomeAdminAction extends Action {
    
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
            
            try{
                //生成作业
                $this->createPaper($filepath);
            } catch(Exception $e) {
                Log::write($e->getMessage(), Log::ERR);
                $this->ajaxReturn(null, "读取作业模板失败，请检测作业模板填写是否正确！", -1);
            }
            
            $this->ajaxReturn(null, "OK");
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
                Log::write("作业名称不能为空", Log::ERR);
                $this->ajaxReturn(null, "作业名称不能为空", -1);
                return;
            }
            if(!is_numeric($totalScore) || !is_numeric($passScore)) {
                Log::write($title.'--'.$totalScore. " AND " . $passScore . '必须同时为整数', Log::ERR);
                $this->ajaxReturn(null, $title.'--'.$totalScore. " AND " . $passScore . '必须同时为整数', -1);
                return;
            }
        }
        
        $uid = $this->mid;
        $actionTime = time();
        $paper = array("name"=>$title, "uid"=>$uid, "ctime"=>$actionTime, "type"=>1,
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
    
    public function hlist() {
        //参数 p=currentPage
        $pageSize = 20;
        $result = M("homework")->where(array('type'=>1,'is_del'=>0))->order('id desc')->findPage($pageSize);
    
        $h_ids = array();
    
        $homeworks = $result['data'];
    
        foreach ($homeworks as $homework) {
            array_push($h_ids, $homework['id']);
        }
    
        $this->assign("homeworks", $homeworks);
        $this->assign("page", $result['html']);
        $this->display("homework_list");
    }
    
    public function detail() {
        $hw_id = intval($_REQUEST['hw_id']);
        $uid = intval($_REQUEST['uid']);
        
        $query = array("type"=>1, 'id'=>$hw_id, "is_del"=>0);//type=1,作业; type=0, 考试
        $homework = M('homework')->where($query)->find();
        
        $hid = $homework['id'];
        $query = array('hw_id'=>$hid, 'is_del'=>0);
        $questions = M('homework_question')->where($query)->findAll();
        
        $query = array('hw_id'=>$hid, 'uid'=>$uid);
        $record = M('homework_record')->where($query)->find();
        
        $query = array('hw_id'=>$hid, 'uid'=>$uid);
        $answers = M('homework_answer')->where($query)->findAll();
        
        foreach ($questions as &$question) {
            $qid = $question['id'];
            foreach ($answers as $answer) {
                if ($answer['qid'] == $qid) {
                    $question['y_answer'] = $answer['content'];
                    $question['y_score'] = $answer['score'];
                    $question['answer_id'] = $answer['id'];
                }
            }
        }
        
        $user = M('user')->where(array('uid'=>$uid))->find();
        
        $this->assign('uid', $uid);
        $this->assign('user', $user);
        $this->assign('homework', $homework);
        $this->assign('questions', $questions);
        $this->assign('answers', $answers);
        
        if(!isManageGroup()) {
            $this->display("preview_view");
        } else {
            $this->assign('score', $record['score']);//得分
            $this->display("pending_view");//待打分页面
        }
    }
    
    public function recordList() {
        $id = intval($_REQUEST['hw_id']);
        $classid = intval($_REQUEST['classid']);
        
        $classSql = "SELECT DISTINCT w.weiba_id, w.weiba_name from ts_homework_schedule hs
            LEFT JOIN ts_weiba w ON hs.class_id = w.weiba_id
            WHERE hs.hw_id=".$id;
        
        $classes = M('homework_record')->query($classSql);
        if ($classid < 1 && !empty($classes)) {
            $classid = $classes[0]['weiba_id'];//取第一个
        }
        
        $this->assign('classes', $classes);
        
        $homework = M('homework')->where(array('id'=>$id))->find();
        
        $query = array('hw_id'=>$id);
        
        $sql = "SELECT hr.uid, u.uname, u.location,u.phone, hr.ctime, hr.score, hr.is_grade FROM ts_homework_record hr LEFT JOIN ts_user u ON hr.uid = u.uid";
        $sql .=" WHERE hr.hw_id=" . $id . " and hr.class_id=$classid ORDER BY hr.ctime DESC";
        
        $records = M('')->query($sql);
        //TODO 无分页
        $this->assign('homework', $homework);
        $this->assign('hw_id', $id);
        $this->assign('classid', $classid);
        $this->assign('records', $records);
        $this->display("record_list");
    }
    
    /**
     * 打分
     */
    public function grade() {
        $id = intval($_REQUEST['aid']);
        
        if(!is_numeric($_REQUEST['score'])) {
            $this->ajaxReturn(null, '得分必须是数字', 0);
        }
        $score = intval($_REQUEST['score']);
        if ($score < 0) {
            $this->ajaxReturn(null, '得分必须 >=0', 0);
        }
        $answer = M("homework_answer")->where(array('id'=>$id))->find();
        if (empty($answer)) {
            $this->ajaxReturn(null, '打分成功', 0);
        }
        $question = M('homework_question')->where(array('id'=>$answer['qid']))->find();
        if (empty($question)) {
            $this->ajaxReturn(null, '题目不存在', 0);
        }
        if ($score > $question['score']) {
            $this->ajaxReturn(null, '得分不能大于本题总分', 0);
        }
        M("homework_answer")->where(array('id'=>$id))->save(array('score'=>$score));
        $this->ajaxReturn(null, '打分成功');
    }
    
    /**
     * 退回重考
     */
    public function redo() {
        $uid = intval($_REQUEST['uid']);
        $hw_id = intval($_REQUEST['hw_id']);
        M("homework_answer")->where(array('uid'=>$uid, 'hw_id'=>$hw_id))->delete();
        M("homework_record")->where(array('uid'=>$uid, 'hw_id'=>$hw_id))->save(array('is_grade'=>0, 'score'=>0, 'ctime'=>time()));
        $this->ajaxReturn(null, '退回成功');
    }
    
    /**
     * 删除试卷
     */
    public function delete() {
        $hw_id = intval($_REQUEST['hw_id']);
        $homework = M('homework')->where(array('id'=>$hw_id, 'is_del'=>0))->find();
        if (empty($homework)) {
            $this->ajaxReturn(null, '作业不存在');
        }
        
        $count = M("homework_record")->where(array('hw_id'=>$hw_id, 'is_grade'=>array('IN', array(1, 2))))->count();
        
        if ($count > 0) {
            $this->ajaxReturn(null, '已结存在作业记录，无法删除');
        }
        M('homework')->where(array('id'=>$hw_id))->save(array('is_del'=>1));
        $this->ajaxReturn(null, '删除成功');
    }
    
    /**
     * 完成打分
     */
    public function submit() {
        $uid = intval($_REQUEST['uid']);
        $hw_id = intval($_REQUEST['hw_id']);
        $homework = M('homework')->find(array('id'=>$hw_id, 'is_del'=>0));
        if (empty($homework)) {
            $this->ajaxReturn(null, '作业不存在');
        }
        $sql = "select sum(score) as total from __TABLE__ where uid=".$uid." and hw_id=".$hw_id;
        $data = M("homework_answer")->query($sql);
        $total = $data[0]['total'];
        $record = M("homework_record")->where(array('uid'=>$uid, 'hw_id'=>$hw_id))->find();
        
        if (empty($record)) {
            $this->ajaxReturn(null, '没找到该作业记录');
        }
        
        M("homework_record")->where(array('uid'=>$uid, 'hw_id'=>$hw_id))->save(array('score'=>$total, 'is_grade'=>2));
        
        $this->ajaxReturn(null, '批阅成功');
    }
    
    public function schedule() {
        $hw_id = intval($_REQUEST['hw_id']);
        
        //TODO 最近50个班级
        $classes = M('weiba')->query("SELECT weiba_id, weiba_name, ctime FROM ts_weiba WHERE is_del=0 ORDER BY ctime desc limit 0,50");
        
        $homework = M('homework')->where(array('id'=>$hw_id, 'is_del'=>0))->find();
        
        
        $schedules = M('homework_schedule')->query("SELECT wb.weiba_name, hs.id, hs.start_date, hs.end_date 
            from ts_homework_schedule hs LEFT JOIN ts_weiba wb on class_id = wb.weiba_id where hs.hw_id=".$hw_id);
        
        $this->assign("schedules", $schedules);
        $this->assign("homework", $homework);
        $this->assign("classes", $classes);
        $this->display();
    }
    
    /**
     * 安排考试
     */
    public function schedule_test() {
        $hw_id = intval($_REQUEST['hw_id']);
        $weiba_id = intval($_REQUEST['weiba_id']);
        $startDate = $_REQUEST['startDate'];
        $endDate = $_REQUEST['endDate'];
        
        if ($endDate <= $startDate) {
            $this->ajaxReturn(null, '结束时间必须大于开始时间', -1);
        }
        
        $homework = M('homework')->where(array('id'=>$hw_id, 'type'=>1, 'is_del'=>0))->find();
        
        if (empty($homework)) {
            $this->ajaxReturn(null, '作业不存在', -1);
        }
        
        $class = M('weiba')->where(array('weiba_id'=>$weiba_id, 'is_del'=>0))->find();
        
        if (empty($class)) {
            $this->ajaxReturn(null, '班级不存在', -1);
        }
        
        $record = M('homework_schedule')->where(array('hw_id'=>$hw_id, 'class_id'=>$weiba_id))->find();
        
        if(!empty($record)) {
            $this->ajaxReturn(null, '不能重复安排作业', -1);
        }
        
        $data = array('hw_id'=>$hw_id, 'class_id'=>$weiba_id, 'type'=>1,
            'start_date'=>$startDate, 'end_date'=>$endDate, 'ctime'=>time());
        
        M('homework_schedule')->add($data);
        
        $members = M('weiba_follow')->where(array('weiba_id'=>$class['weiba_id']))->findAll();
        
        foreach ($members as $member) {
            if ($member['level'] == 1) { //成员
                $data = array('uid'=>$member['follower_uid'], 'hw_id'=>$hw_id, 'class_id'=>$weiba_id, 'ctime'=>time());
                M('homework_record')->add($data);
            }
        }
        
        $this->ajaxReturn(null, '安排作业成功');
    }
    
    /**
     * 删除考试安排
     */
    public function del_schedule() {
        $sid = intval($_REQUEST['sid']);
        $record = M('homework_schedule')->where(array('id'=>$sid))->find();
        
        if (empty($record)) {
            $this->ajaxReturn(null, '考试安排不存在', -1);
        }
        
        $records = M('homework_record')->where(array('hw_id'=>$record['hw_id'], 
            'class_id'=>$record['class_id'], 'is_grade'=>array('IN', array(1, 2))))->findAll();
        
        if (!empty($records)) {
            $this->ajaxReturn(null, '已经有学员提交试卷,无法删除该考试安排', -1);
        }
        
        M('homework_schedule')->where(array('id'=>$sid))->delete();
        
        M('homework_record')->where(array('hw_id'=>$record['hw_id'], 'class_id'=>$record['class_id']))->delete();
        
        $this->ajaxReturn(null, '删除成功');
    }
    
    private function createFailed($hw_id, $errorMsg) {
        if(C('LOG_RECORD')) {
            Log::write($errorMsg, Log::ERR);
        }
        //清除临时数据
        M('homework')->where(array('id'=>$hw_id))->delete();
        M('homework_question')->where(array('hw_id'=>$hw_id))->delete();
    
        $this->ajaxReturn(null, $errorMsg, -1);
    }
    
}