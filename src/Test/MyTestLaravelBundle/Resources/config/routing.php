<?php

use Symfony\Component\Routing\RouteCollection;
use Symfony\Component\Routing\Route;

$collection = new RouteCollection();

$collection->add('test_my_test_laravel_homepage', new Route('/hello/{name}', array(
    '_controller' => 'TestMyTestLaravelBundle:Default:index',
)));

return $collection;
