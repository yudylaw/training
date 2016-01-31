<?php

/**
 * 课程资源学习-数据模型
 * @author sjzhao
 *
 */
class CourseResourceLearningModel extends Model {
    
    protected $tableName = 'course_resource_learning';
    protected $error = '';
    /**
     * 根据条件获取资源学习记录
     * @param array $param
     */
    public function getCourseLearningByCondition($param){
        $map = array();
        $map['is_del'] = 0;//默认查询未删除的课程
        if(!empty($param['resourceid'])){
            $map['resourceid'] = $param['resourceid'];
        }
        if(!empty($param['uid'])){
            $map['uid'] = $param['uid'];
        }
        if(!empty($param['classid'])){
            $map['classid'] = $param['classid'];
        }
        $result = $this->where($map)->find();
        return $result;
    }
    /**
     * 添加学习记录
     */
    public function addResLearning($param){
        $map = array();
        $map['is_del'] = 0;
        !empty($param['class_id']) && $map['classid'] = $param['class_id'];//班级id
        !empty($param['uid']) ? $map['uid'] = $param['uid'] : $map['uid'] = $this->uid;//用户id
        !empty($param['resourceid']) && $map['resourceid'] = $param['resourceid'];//资源id
        !empty($param['percent']) && $percent = $param['percent'];//学习进度
        $result = $this->where($map)->find();//判断有无学习记录
        if(empty($result)){
            $data['classid'] = $param['class_id'];
            $data['uid'] = $param['uid'];
            $data['resourceid'] = $param['resourceid'];
            $data['percent'] = $percent;
            $data['start_date'] = time();
            $res = $this->add($data);
        }else{
            if($result['percent'] < 100){//如果存在学习进度直接更新学习进度
                $res = $this->where($map)->save(array('percent'=>$percent));
            }
            $res = 0;//已完成学习无需更新学习进度
        }
        return $res;
    }
}