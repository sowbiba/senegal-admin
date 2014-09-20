<?php

namespace Pfd\ContractBundle\Form\Type;

use Pfd\Sdk\Model\Contract;
use Pfd\Sdk\Contract\Query\ContractQuery;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

/**
 * Class ContractQueryType
 */
class ContractQueryType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add(
                'name',
                'text',
                [
                    'label'    => 'Nom',
                    'required' => false,
                    'attr'     => ['class' => 'form-control filter-name']
                ]
            )
            ->add(
                'revision_status',
                'choice',
                [
                    'label'    => 'Révision',
                    'choices'     => [
                        ContractQuery::REVISION_STATUS_IN_PROGRESS         => 'Révision en cours',
                        ContractQuery::REVISION_STATUS_SUBMITTED           => 'Révision à valider',
                        ContractQuery::REVISION_STATUS_PENDING_PUBLICATION => 'Révision en attente de publication',
                        ContractQuery::REVISION_STATUS_PUBLISHED           => 'Révision publiée',
                        ContractQuery::REVISION_STATUS_ALL                 => 'Révision (tout statut)',
                        ContractQuery::REVISION_STATUS_NO_REVISION         => 'Aucune révision',
                        ContractQuery::REVISION_STATUS_NOT_REVISIONABLE    => 'N\'utilise pas les révisions'
                    ],
                    'required'    => false,
                    'attr'        => ['class' => 'form-control filter-select-revision_status']
                ]
            )
            ->add(
                'productLine',
                'sdk_model',
                [
                    'class'    => 'Pfd\Sdk\Model\ProductLine',
                    'label'    => 'Gamme',
                    'required' => false,
                    'attr'     => ['class' => 'form-control filter-select-product_line']
                ]
            )
            ->add(
                'distributor',
                'sdk_model',
                [
                    'class'    => 'Pfd\Sdk\Model\Company',
                    'label'    => 'Distributeur (société)',
                    'required' => false,
                    'attr'     => ['class' => 'form-control filter-select-distributor']
                ]
            )
            ->add(
                'distributorGroup',
                'sdk_model',
                [
                    'class'    => 'Pfd\Sdk\Model\CompanyGroup',
                    'label'    => 'Distributeur (groupe)',
                    'required' => false,
                    'attr'     => ['class' => 'form-control filter-select-distributor-group']
                ]
            )
            ->add(
                'insurer',
                'sdk_model',
                [
                    'class'    => 'Pfd\Sdk\Model\Company',
                    'label'    => 'Assureur (société)',
                    'required' => false,
                    'attr'     => ['class' => 'form-control filter-select-insurer']
                ]
            )
            ->add(
                'active',
                'choice',
                [
                    'label'       => 'Activé',
                    'choices'     => [true => 'oui', false => 'non'],
                    'required'    => false,
                    'empty_value' => 'oui ou non',
                    'attr'        => ['class' => 'form-control filter-select-is_active']
                ]
            )
            ->add(
                'marketed',
                'choice',
                [
                    'label'       => 'Commercialisé',
                    'choices'     => [true => 'oui', false => 'non'],
                    'required'    => false,
                    'empty_value' => 'oui ou non',
                    'attr'        => ['class' => 'form-control filter-select-is_on_sale']
                ]
            )
            ->add(
                'inheritance',
                'choice',
                [
                    'label'       => 'Héritage',
                    'choices'     => [ Contract::NOT_CHILD_INHERITANCE => 'Contrats pères (ou sans contrat fils)', Contract::CHILD_INHERITANCE => 'Contrats fils'],
                    'required'    => false,
                    'empty_value' => 'Contrats pères et fils',
                    'attr'        => ['class' => 'form-control filter-select-inheritance']
                ]
            )
            ->add(
                'btn_search',
                'submit',
                [
                    'label' => 'Recherche',
                    'attr'  => ['class' => 'btn btn-primary']
                ]
            );
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'contract_query';
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'csrf_protection' => false,
            'method' => 'GET'
        ));
    }
}
