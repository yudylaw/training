<?php

class IndexAction extends Action {
    
    public function index() {
        $this->display();
    }
    
    public function add() {
        $actionTime = time();
        $data = array("name"=>"测试-作业-2", "uid"=>110, "ctime"=>$actionTime, "type"=>1,
            "total_score"=>100, "pass_score"=>60, "is_del"=>0);
        $result = M('homework')->add($data);
        dump($result);
    }
    
    public function detail() {
        $id = intval($_REQUEST['id']);
        
        $query = array("type"=>0, 'id'=>$id, "is_del"=>0);//type=1,作业; type=0, 考试
        $homework = M('homework')->where($query)->find();
        
        $hid = $homework['id'];
        $query = array('hw_id'=>$hid, 'is_del'=>0);
        $questions = M('homework_question')->where($query)->findAll();
        
        $this->assign('homework', $homework);
        $this->assign('questions', $questions);
        $this->display();
    }
    
    public function save() {
        $data = array("name"=>"测试-作业-更新-1", "ctime"=>time());
        $result = M("homework")->where(array("id"=>3, "type"=>1))->save($data);
        dump($result);
    }
    
    public function hlist() {
        //参数 p=currentPage
        $pageSize = 4;
        $result = M("homework")->where(array('type'=>0,'is_del'=>0))->order('id desc')->findPage($pageSize);
        $this->assign("homeworks", $result['data']);
        $this->assign("page", $result['html']);
        $this->display("homework_list");
    }
    
    public function delete() {
        $data = array("is_del"=>1, "ctime"=>time());
        $result = M("homework")->where(array("id"=>3))->save($data);
        dump($result);
    }
    
}