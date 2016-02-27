<?php 

class AdminAction extends Action {
    
    private $types = array('单选题'=>1, '多选题'=>2, '简答题'=>3);
    
    /**
     * 导入试卷模板,生成考试试卷
     */
    public function createPaper() {
        $filename = SITE_PATH . "/paper_template.xls";
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
        
        $uid = 0;//TODO
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
    
    public function hlist() {
        //参数 p=currentPage
        $pageSize = 20;
        $result = M("homework")->where(array('type'=>0,'is_del'=>0))->order('id desc')->findPage($pageSize);
    
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
        
        $query = array("type"=>0, 'id'=>$hw_id, "is_del"=>0);//type=1,作业; type=0, 考试
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
        
        if ($record['is_grade'] == 1) {
            $this->assign('score', $record['score']);//得分
            $this->display("result_view");//打分完成后的页面
        } else {
            $this->display("pending_view");//待打分页面
        }
    }
    
    public function recordList() {
        $id = intval($_REQUEST['hw_id']);
        
        $homework = M('homework')->where(array('id'=>$id))->find();
        
        $query = array('hw_id'=>$id);
        
        $sql = "SELECT hr.uid, u.uname, hr.ctime, hr.score, hr.is_grade FROM ts_homework_record hr LEFT JOIN ts_user u ON hr.uid = u.uid";
        $sql .=" WHERE hr.hw_id=" . $id;
        
        $records = M('')->query($sql);
        //TODO 无分页
        $this->assign('homework', $homework);
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
            $this->ajaxReturn(null, '回答不存在', 0);
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
        M("homework_record")->where(array('uid'=>$uid, 'hw_id'=>$hw_id))->delete();
        $this->ajaxReturn(null, '退回成功');
    }
    
    /**
     * 删除试卷
     */
    public function delete() {
        $hw_id = intval($_REQUEST['hw_id']);
        $homework = M('homework')->find(array('id'=>$hw_id, 'is_del'=>0));
        if (empty($homework)) {
            $this->ajaxReturn(null, '作业或考试不存在');
        }
        
        $count = M("homework_record")->where(array('hw_id'=>$hw_id))->count();
        
        if ($count > 0) {
            $this->ajaxReturn(null, '已结存在考试记录，无法删除');
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
            $this->ajaxReturn(null, '作业或考试不存在');
        }
        $sql = "select sum(score) as total from __TABLE__ where uid=".$uid." and hw_id=".$hw_id;
        $data = M("homework_answer")->query($sql);
        $total = $data[0]['total'];
        $record = M("homework_record")->where(array('uid'=>$uid, 'hw_id'=>$hw_id))->find();
        
        if (empty($record)) {
            $this->ajaxReturn(null, '没找到该考试记录');
        }
        
        M("homework_record")->where(array('uid'=>$uid, 'hw_id'=>$hw_id))->save(array('score'=>$total, 'is_grade'=>1));
        
        $this->ajaxReturn(null, '阅卷成功');
    }
    
}