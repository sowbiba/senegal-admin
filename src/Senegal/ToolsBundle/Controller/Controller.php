<?php

namespace Senegal\ToolsBundle\Controller;

use Pagerfanta\Pagerfanta;
use Senegal\Pager\Adapter\SdkPagerAdapter;
use Api\Sdk\Query\SortQuery;
use Api\Sdk\QueryableSdkInterface;
use Symfony\Bundle\FrameworkBundle\Controller\Controller as BaseController;
use Symfony\Component\Form\Form;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

/**
 * Base class for all controllers.
 *
 * Provides shortcut methods to services.
 */
abstract class Controller extends BaseController
{
    /**
     * This method should be used to fetch data from request matching the form,
     * given you have extra data you want to ignore.
     *
     * The actual case is the query string, containing form filters AND pagination
     * sorting informations.
     *
     * This method will filter an array of data to return only data matching
     * a given form.
     *
     * @param Form  $form the form we want to bind.
     * @param array $data the data to filter
     *
     * @return array an array of data with no extradata, according to form
     */
    protected function getFormData(Form $form, array $data)
    {
        $formData = $form->all();

        $newData = array_intersect_key($data, $formData);

        return $newData;
    }

    /**
     * @param $name
     *
     * @return \Api\Sdk\SdkInterface
     */
    protected function getSdk($name)
    {
        return $this->get('senegal.mediator.sdk')->getSdk($name);
    }

    /**
     * @param QueryableSdkInterface $sdk
     * @param array                 $options
     *
     * @return Pagerfanta           $pager
     */
    protected function createSdkPager(QueryableSdkInterface $sdk, array $options = array())
    {
        $request = $this->getRequest();
        $sort    = $request->query->get('sort', isset($options['default_sort']) ? $options['default_sort'] : null);
        $order   = $request->query->get('order', isset($options['default_order']) ? $options['default_order'] : SortQuery::SORT_ASC);
        $page    = $request->query->get('page', 1);

        $filterQuery = $sdk->getQuery(isset($options['filters']) ? $options['filters'] : array());
        $query       = $sdk->getSortQuery($filterQuery, array(array($sort, $order)));

        // If the SDK do not define a specific sort query we fallback to the default one
        if (null === $query) {
            $query = new SortQuery($filterQuery, array(array($sort, $order)));
        }

        $adapter = new SdkPagerAdapter($sdk, $query);
        $pager   = new Pagerfanta($adapter);

        $pager->setMaxPerPage(isset($options['max_per_page']) ? $options['max_per_page'] : 20);
        $pager->setCurrentPage($page);

        return $pager;
    }

    /**
     * @param $content
     * @param $params
     *
     * @return array|JsonResponse
     * @throws \Symfony\Component\HttpKernel\Exception\NotFoundHttpException
     * @throws \Symfony\Component\Security\Core\Exception\AccessDeniedException
     */
    protected function renderLegacy($content, $params = array())
    {
        // Catch legacy page not found and throw a real 404 exception
        if(false !== strpos($content, "Page introuvable (404)")) {
            throw $this->createNotFoundException();
        // Catch legacy insufficient permission error and throw a real 403 exception
        } elseif(false !== strpos($content, "Page inaccessible : vous n'avez pas les droits suffisants pour accéder à cette page")) {
            throw $this->createAccessDeniedException();
        } elseif (null !== $datas = json_decode($content)) {
            return new JsonResponse(json_decode($content));
        } elseif ($this->getRequest()->isXmlHttpRequest()) {
            return new Response($content);
        }

        $params["content"] = $content;

        return $params;
    }
}
