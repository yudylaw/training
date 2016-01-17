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
    
    public function query() {
        $query = array("type"=>1, "is_del"=>0);//type=1,作业; type=0, 考试
        $results = M('homework')->where($query)->findAll();
        
        foreach ($results as $row) {
            dump($row);
        }
    }
    
    public function save() {
        $data = array("name"=>"测试-作业-更新-1", "ctime"=>time());
        $result = M("homework")->where(array("id"=>3, "type"=>1))->save($data);
        dump($result);
    }
    
    public function page() {
        global $ts;
        dump($ts['_subjects']);
        //参数 p=currentPage
        $pageSize = 3;
        $result = M("homework")->where(array('is_del'=>0))->order('id desc')->findPage($pageSize);
        dump($result);
    }
    
    public function delete() {
        $data = array("is_del"=>1, "ctime"=>time());
        $result = M("homework")->where(array("id"=>3))->save($data);
        dump($result);
    }
    
}