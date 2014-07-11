<?php

namespace Test\MyTestLaravelBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction($name)
    {
        return $this->render('TestMyTestLaravelBundle:Default:index.html.twig', array('name' => $name));
    }
}
