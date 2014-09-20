<?php

namespace Senegal\AdminBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class AdminController extends Controller
{
    public function indexAction()
    {
        return $this->render('SenegalAdminBundle:Admin:index.html.twig');
    }
}
