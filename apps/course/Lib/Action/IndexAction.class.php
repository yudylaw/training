<?php
/**
 * 课程学习
 * @author sjzhao
 *
 */
class IndexAction extends Action {
    /**
     * 课程学习首页
     */
    public function index() {
        $con['limit'] = !empty($_REQUEST['limit']) ? $_REQUEST['limit'] : 5;//分页大小
        $con['page'] = !empty($_REQUEST['p']) ? $_REQUEST['p'] : 1;
        $result = model("Course")->getCourseList($con);
        $data = $result['data'];
        $totalRows = $result['totalRows'];
        $p = new Page($totalRows,$con['limit']);
        $page = $p->show();
        $this->resource = $result['data'];
        $this->page = $page;
        $this->display();
    }
    /**
     * 课程资源列表页面
     */
    public function detail() {
        $id = $_REQUEST['id'];//课程id
        if(empty($id)){
            $this->error("课程id不能为空");
        }
        $course = model('Course')->getCourseByCondition(array('id'=>$id));
        $course = $course[0];
        $start_date = $course['start_date'];
        $end_date = $course['end_date'];
        if($start_date == 0 || $start_date > time()){
            $this->error("课程未开始");
        }
        if($end_date < time()){
            $this->error("课程已经结束");
        }
        $courseresource = model('CourseResource')->getResourceByCondition(array('course_id'=>$id,'uid'=>$this->uid));
        $data = $courseresource['data'];
        $this->courseresource = $data;
        $totalRows = $courseresource['totalRows'];
        $con['limit'] = !empty($_REQUEST['limit']) ? $_REQUEST['limit'] : 5;//分页大小
        $p = new Page($totalRows,$con['limit']);
        $page = $p->show();
        $this->page = $page;
        $this->courseid = $id;
        $this->display();
    }
    
    public function create(){
        $this->display();
    }
    /**
     * 学习页面
     */
    public function video() {
        $resid = $_REQUEST['id'];//资源id
        if(empty($resid)){
            $this->error("资源id不能为空!");
        }
        $resource = model('CourseResource')->getResourceById($resid);
        $resource = $resource[0];
        $ext = $resource['ext'];
        $courseresourcelearning = model('CourseResourceLearning');
        if(in_array(strtolower($ext), array("xlsx","xls","pptx","ppt"))){//excel和ppt直接下载,表示已完成学习
            $uid = $this->uid;
            $result = $courseresourcelearning->addResLearning(array('uid'=>$uid,'resourceid'=>$resid,'percent'=>100));
            Http::download('/'.$resource['save_path'].$resource['save_name']);
        }else{//视频进入播放页面
            $this->previewurl = SITE_URL.'/data/upload/'.$resource['save_path'].$resource['save_name'];
            $this->resource = $resource;
            //获取视频学习进度，实现记忆播放
            $percent = $courseresourcelearning->where(array('resourceid'=>$resid))->getField('percent');
            $this->percent = $percent;
            //视频部分播放进度在前段js部分控制
            $this->display();
        }
    }
}