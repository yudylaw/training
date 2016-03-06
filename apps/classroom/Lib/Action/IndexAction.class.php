<?php

class IndexAction extends Action {

    public function classroom_list() {
        $followList = M('weiba_follow')->where(array('follower_uid'=>$this->mid))->findAll();
        
        $classroomIds = array();
        
        foreach ($followList as $follow) {
            array_push($classroomIds, $follow['weiba_id']);
        }
        
//         $classroomList = M('weiba')->where(array('weiba_id'=>array('IN', $classroomIds), 'is_del'=>0))->findAll();
        
        $ids = implode(',', $classroomIds);
        
        $sql = "SELECT w.weiba_name, w.weiba_id, w.ctime, w.`subject`, w.follower_count, u.uname ";
        $sql .="FROM ts_weiba w LEFT JOIN ts_user u ON w.admin_uid = u.uid AND w.is_del = 0 AND weiba_id IN (".$ids.")";
        
        $classroomList = M('weiba')->query($sql);
        
        $this->assign('classroomList', $classroomList);
        $this->display();
    }
    
}