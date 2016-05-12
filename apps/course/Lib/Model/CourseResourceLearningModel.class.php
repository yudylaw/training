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
            $data['percent'] = !empty($percent) ? $percent : 0;//假如未获取到进度则初始化为0
            $data['ctime'] = time();
            $data['start_date'] = time();
            $data['end_date'] = time();//记录最近一次学习时间
            $res = $this->add($data);
        }else{
            if($result['percent'] < $percent){//如果存在学习进度并且当前进度大于之前进度直接更新学习进度
                $res = $this->where($map)->save(array('percent'=>$percent,'end_date'=>time()));
            }else{
                $res = 0;//已完成学习或者当前进度小于原来进度无需更新学习进度
            }
            
        }
        if($res && $percent == 100){//完成该资源学习更新课程总体学习进度
            $map2['id'] = $param['resourceid'];
            $courseresource = model('CourseResource');
            //根据资源获得所属的课程id
            $course_id = $courseresource->where($map2)->getField("course_id");
            $course_id = intval($course_id);
            //根据课程id获得该课程所属的全部资源数,不包括已删除资源
            $totalresources = $courseresource->where(array('course_id'=>$course_id,'is_del'=>0))->findAll();
            $totalnum = count($totalresources);
            $resids = array();
            foreach ($totalresources as $val){
                array_push($resids, $val['id']);
            }
            //该课程中已完成的资源数量
            $maps['uid'] = $map['uid'];
            $maps['percent'] = 100;
            !empty($param['class_id']) && $maps['classid'] = $param['class_id'];
            $maps['resourceid'] = array("IN",$resids);
            $maps['is_del'] = 0;//已删除的资源不再统计学习记录
            $finishednum = model('CourseResourceLearning')->where($maps)->count();
            $percent = round(($finishednum / $totalnum) * 100);
            $data2['uid'] = $map['uid'];
            !empty($param['class_id']) && $data2['class_id'] = $param['class_id'];
            $data2['course_id']  = $course_id;
            $data2['percent'] = $percent;
            if($percent == 100){//完成学习记录结束时间
                $data2['end_date'] = time(); 
            }
            model('CourseLearning')->addCourseLearning($data2);//保存课程学习进度
        }
        return $res;
    }
    /**
     * 获取学习记录列表
     */
    public function getLearningList($param){
        $map = array();
        $cid = $param['course_id'];
        $resids = array();
        $resources = model('CourseResource')->where(array('course_id'=>$cid))->findAll();
        foreach ($resources as $val){
            array_push($resids, $val['id']);
        }
        isset($param['class_id']) && $map['classid'] = $param['class_id'];
        isset($param['uid']) && $map['uid'] = $param['uid'];
        $map['resourceid'] = array('IN',$resids);
        $map['is_del'] = 0;//删除资源则删除此资源的学习记录,学习记录不再展示
        $result = $this->where($map)->findPage(20);
        return $result;
//         return $this->getLastSql();
    }
}