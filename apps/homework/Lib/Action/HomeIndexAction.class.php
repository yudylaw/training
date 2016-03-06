<?php

class HomeIndexAction extends Action {
    
    public function detail() {
        $id = intval($_REQUEST['id']);
        
        $query = array("type"=>1, 'id'=>$id, "is_del"=>0);//type=1,作业; type=0, 考试
        $homework = M('homework')->where($query)->find();
        
        $hid = $homework['id'];
        $query = array('hw_id'=>$hid, 'is_del'=>0);
        $questions = M('homework_question')->where($query)->findAll();
        
        $query = array('hw_id'=>$hid, 'uid'=>$this->mid);
        $record = M('homework_record')->where($query)->find();
        
        $query = array('hw_id'=>$hid, 'uid'=>$this->mid);
        $answers = M('homework_answer')->where($query)->findAll();
        
        foreach ($questions as &$question) {
            $qid = $question['id'];
            foreach ($answers as $answer) {
                if ($answer['qid'] == $qid) {
                    $question['y_answer'] = $answer['content'];
                    $question['y_score'] = $answer['score'];
                }
            }
        }
        
        $user = M('user')->where(array('uid'=>$this->mid))->find();
        
        $this->assign('homework', $homework);
        $this->assign('questions', $questions);
        
        if (empty($record)) {
            $this->display("answer_view");//答题页面
        } else {
            $this->assign('answers', $answers);
            if ($record['is_grade'] == 1) {
                $this->assign('score', $record['score']);//得分
                $this->display("result_view");//打分完成后的页面
            } else {
                $this->display("pending_view");//待打分页面
            }
        }
    }
    
    public function hlist() {
        $weibas = M("weiba_follow")->where(array('follower_uid'=>$this->mid))->findAll();
        
        $weiba_ids = array();
        foreach ($weibas as $weiba) {
            array_push($weiba_ids, $weiba['weiba_id']);
        }
        
        $ids = implode(',', $weiba_ids);
        
        $sql = "SELECT h.* from ts_homework_schedule hs LEFT JOIN ts_homework h ON hs.hw_id = h.id WHERE hs.type =1 AND hs.class_id IN (".$ids.")";
        
        $homeworks = M("homework_schedule")->query($sql);
        
        //参数 p=currentPage
//         $pageSize = 20;
//         $result = M("homework_schedule")->where(array('type'=>1,'class_id'=>array("IN", $weiba_ids)))->findPage($pageSize);
//         $result = M("homework")->where(array('type'=>1,'is_del'=>0))->order('id desc')->findPage($pageSize);
        
        $h_ids = array();
        
        foreach ($homeworks as $homework) {
            array_push($h_ids, $homework['id']);
        }
        

        $records = M('homework_record')->where(array("hw_id"=>array("IN", $h_ids), 'uid'=>$this->mid))->findAll();
        
        foreach ($homeworks as &$homework) {
            
            foreach ($records as $record) {
                if ($homework['id'] == $record['hw_id']) {
                    $homework['is_grade'] = $record['is_grade'];
                    $homework['y_score'] = $record['score'];
                }
            }
            
        }
        
        $this->assign("homeworks", $homeworks);
//         $this->assign("page", $result['html']);
        $this->display("homework_list");
    }
    
    /**
     * 答题
     */
    public function answer() {
        $qid = intval($_REQUEST['qid']);
        $hw_id = intval($_REQUEST['hw_id']);
        $answer = $_REQUEST['answer'];
        $result = M('homework_answer')->where(array("uid"=>$this->mid, "qid"=>$qid))->find();
        $question = M('homework_question')->where(array('id'=>$qid))->find();
        if (empty($question)) {
            $this->ajaxReturn(null, "题目不存在!");
        }
        $q_type = $question['type'];
        $data = array('uid'=>$this->mid, 'qid'=>$qid, 'hw_id'=>$hw_id, 'content'=>$answer);
        
        //选择题自动记分
        if (in_array($q_type, array(1, 2))) {
            if ($answer == $question['answer']) {
                $data['score'] = $question['score'];
            } else {
                $data['score'] = 0;
            }
        }
        if(empty($result)) {
            //保存回答
            M('homework_answer')->add($data);
        } else {
            //更新回答
            $data['id'] = $result['id'];
            M('homework_answer')->save($data);
        }
        $this->ajaxReturn(null, "答题成功");
    }
    
    /**
     * 提交试卷
     */
    public function submit() {
        $hw_id = intval($_REQUEST['hw_id']);
        $data = array('hw_id'=>$hw_id, 'uid'=>$this->mid, 'ctime'=>time(), 'score'=>0);
        M('homework_record')->add($data);
        $this->ajaxReturn(null, "提交成功，等待批阅！");
    }
    
}