<?php

namespace Senegal\LayoutBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction()
    {
        return $this->render('SenegalLayoutBundle:Default:index.html.twig');
    }
}
