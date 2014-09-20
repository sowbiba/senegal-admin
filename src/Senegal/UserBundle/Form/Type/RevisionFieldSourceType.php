<?php

namespace Pfd\ContractBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use Pfd\Sdk\Model\Revision;

/**
 * Class RevisionFieldSourceType
 */
class RevisionFieldSourceType extends AbstractType
{
    private $cachedDocuments = null;

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $source = $builder->getData();

        $builder->add('documentId', 'choice',
            [
                'label'    => '',
                'required' => false,
                'choices'  => [-1 => '', null => 'Donnée non documentée'] + $this->getDocumentChoices($options['revision']),
                'error_bubbling' => true,
                'data' => $source->isNotDocumented() ? null : null === $source->getId() ? -1 : $source->getDocumentId(),
            ])
            ->add('page', 'number',
                [
                    'label'    => '',
                    'required' => false,
                    'error_bubbling' => true
                ])
            ->add('pageOffset', 'hidden',
                [
                    'attr'     => [
                        'disabled'  => 'disabled',
                        'class'     => 'form-control form-row-hidden page-offset'
                    ]
                ]);
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'revision_field_source';
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'data_class'      => 'Pfd\Sdk\Model\RevisionFieldSource',
            'csrf_protection' => false,
            'revision'        => null,
        ));
    }

    /**
     * @param integer $revisionId
     *
     * @return array
     */
    public function getDocumentChoices(Revision $revision = null)
    {
        if (null !== $this->cachedDocuments) {
            return $this->cachedDocuments;
        }

        if (null === $revision) {
            return array();
        }

        $documents = $revision->getDocuments();
        $this->cachedDocuments = array();

        foreach ($documents as $document) {
            $this->cachedDocuments[$document->getId()] = $document->getType()->getName();
        }

        return $this->cachedDocuments;
    }
}
