<?php

namespace Nextmoovment\ReferenceBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction($name)
    {
        return $this->render('NextmoovmentReferenceBundle:Default:index.html.twig', array('name' => $name));
    }
}
