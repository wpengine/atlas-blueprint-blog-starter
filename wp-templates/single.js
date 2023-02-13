import * as MENUS from 'constants/menus';

import { WordPressBlocksViewer } from '@faustwp/blocks';
import { gql } from '@apollo/client';
import {
  Header,
  Footer,
  Main,
  EntryHeader,
  NavigationMenu,
  ContentWrapper,
  FeaturedImage,
  SEO,
  TaxonomyTerms,
} from 'components';
import { pageTitle } from 'utilities';
import { BlogInfoFragment } from 'fragments/GeneralSettings';

import flatListToHierarchical from '../utilities/flatListToHierarchical';
import components from '../wp-blocks';


function fragmentData(blocks) {
  const entries = Object.keys(blocks).map(key => {
    return blocks[key]?.fragments?.entry ? blocks[key]?.fragments?.entry : null;
  }).filter(Boolean);
  const blockKeys = Object.keys(components).map(key => {
    return components[key]?.fragments?.key ? components[key]?.fragments?.key : null;
  }).filter(Boolean);
  return {
    entries: entries.map(fragment => `${getGqlString(fragment)}\n`).join('\n'),
    keys: blockKeys.map(key => `...${key}\n`).join('\n')
  }
}

function normalize(string) {
  return string.replace(/[\s,]+/g, ' ').trim();
}

function getGqlString(doc) {
  return doc.loc && normalize(doc.loc.source.body);
}

export default function Component(props) {
  // Loading state for previews
  if (props.loading) {
    return <>Loading...</>;
  }

  const { title: siteTitle, description: siteDescription } =
    props?.data?.generalSettings;
  const primaryMenu = props?.data?.headerMenuItems?.nodes ?? [];
  const footerMenu = props?.data?.footerMenuItems?.nodes ?? [];
  const { title, content, featuredImage, date, author, contentBlocks } = props.data.post;
  const blocks = flatListToHierarchical(contentBlocks);

  return (
    <>
      <SEO
        title={pageTitle(
          props?.data?.generalSettings,
          title,
          props?.data?.generalSettings?.title
        )}
        description={siteDescription}
        imageUrl={featuredImage?.node?.sourceUrl}
      />
      <Header
        title={siteTitle}
        description={siteDescription}
        menuItems={primaryMenu}
      />
      <Main>
        <>
          <EntryHeader
            title={title}
            image={featuredImage?.node}
            date={date}
            author={author?.node?.name}
          />
          <div className="container">
            <ContentWrapper>
              <p>Hello world</p>
              <WordPressBlocksViewer contentBlocks={blocks}/>
              <TaxonomyTerms post={props.data.post} taxonomy={'categories'} />
              <TaxonomyTerms post={props.data.post} taxonomy={'tags'} />
            </ContentWrapper>
          </div>
        </>
      </Main>
      <Footer title={siteTitle} menuItems={footerMenu} />
    </>
  );
}

Component.query = gql`
  ${BlogInfoFragment}
  ${NavigationMenu.fragments.entry}
  ${FeaturedImage.fragments.entry}
  ${fragmentData(components).entries}
  query GetPost(
    $databaseId: ID!
    $headerLocation: MenuLocationEnum
    $footerLocation: MenuLocationEnum
    $asPreview: Boolean = false
  ) {
    post(id: $databaseId, idType: DATABASE_ID, asPreview: $asPreview) {
      title
      content
      date
      author {
        node {
          name
        }
      }
      tags {
        edges {
          node {
            name
            uri
          }
        }
      }
      categories {
        edges {
          node {
            name
            uri
          }
        }
      }
      ...FeaturedImageFragment
      contentBlocks(flat: true) {
        __typename
        renderedHtml
        id: nodeId
        parentId
        ${fragmentData(components).keys}
      }
    }
    generalSettings {
      ...BlogInfoFragment
    }
    headerMenuItems: menuItems(where: { location: $headerLocation }) {
      nodes {
        ...NavigationMenuItemFragment
      }
    }
    footerMenuItems: menuItems(where: { location: $footerLocation }) {
      nodes {
        ...NavigationMenuItemFragment
      }
    }
  }
`;

Component.variables = ({ databaseId }, ctx) => {
  return {
    databaseId,
    headerLocation: MENUS.PRIMARY_LOCATION,
    footerLocation: MENUS.FOOTER_LOCATION,
    asPreview: ctx?.asPreview,
  };
};
