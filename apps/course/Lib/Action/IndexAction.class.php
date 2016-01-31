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
        $courseresource = model('CourseResource')->getResourceByCondition(array('course_id'=>$id));
        $data = $courseresource['data'];
        $this->courseresource = $data;
        $totalRows = $courseresource['totalRows'];
        $con['limit'] = !empty($_REQUEST['limit']) ? $_REQUEST['limit'] : 5;//分页大小
        $p = new Page($totalRows,$con['limit']);
        $page = $p->show();
        $this->page = $page;
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
        $data = array();
        $data['classid'] = $this->classid;
        $data['uid'] = $this->uid;
        $data['resourceid'] = $resid;
        $data['percent'] = 50;
        $data['start_date'] = time();
        model('CourseResourceLearning')->add($data);
        $resource = model('CourseResource')->getResourceById($resid);
        $resource = $resource[0];
        $this->previewurl = C('UPLOAD_ADD').$resource['save_path'].$resource['save_name'];
        $this->resource = $resource;
        $this->display();
    }
}