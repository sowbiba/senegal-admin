<?php

namespace Test\MyTestBundle\Controller;

use \Maatwebsite\Excel\Excel;
use Illuminate\Foundation\Application;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller {

    public function indexAction($name) {
        return $this->render('TestMyTestBundle:Default:index.html.twig', array('name' => $name));
    }

    public function laravelAction() {
        $app = new Application();
        $excel = new ExcelServiceProvider($app);
        var_dump($excel);die();
        
        $data = array(
            array('data1', 'data2'),
            array('data3', 'data4')
        );

        Excel::create('test.xls', function($excel) use($data) {
            // Set the title
            $excel->setTitle('Our new awesome title');

            // Chain the setters
            $excel->setCreator('Maatwebsite')
                ->setCompany('Maatwebsite');

            $excel->sheet('Sheetname', function($sheet) use($data) {

                $sheet->fromArray($data);
            });

            // Call them separately
            $excel->setDescription('A demonstration to change the file properties');
        })->export('xls');

        return $this->render('TestMyTestBundle:Default:laravel.html.twig');
    }

}
