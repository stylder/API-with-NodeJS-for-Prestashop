########################
# BACKUP YOUR DATABASE #
########################
#
# This script empties the product table and all linked tables with dependent data.
#
# This is somewhat arbitrary: for example, we're keeping the tags but we're deleting
# attachments, which could be reused for new products.
#
# "*" indicates a Primary Key
#
########################
# BACKUP YOUR DATABASE #
########################


# All these tables have an id_product primary key [or should have!]
TRUNCATE TABLE ps_product;					   # *id_product  id_supplier id_manufacturer id_tax_rules_group id_category_default id_color_default
TRUNCATE TABLE ps_product_attachment;			# *id_product *id_attachment
TRUNCATE TABLE ps_product_country_tax;		   #  id_product  id_country id_tax
TRUNCATE TABLE ps_product_group_reduction_cache; # *id_product *id_group
TRUNCATE TABLE ps_product_lang;				  # *id_product *id_lang
TRUNCATE TABLE ps_product_sale;				  # *id_product
TRUNCATE TABLE ps_product_tag;				   # *id_product *id_tag
TRUNCATE TABLE ps_category_product;			  #  id_product  id_category
TRUNCATE TABLE ps_compare_product;			   #  id_product *id_compare_product id_guest id_customer
TRUNCATE TABLE ps_feature_product;			   # *id_product *id_feature
TRUNCATE TABLE ps_search_index;				  # *id_product *id_word
TRUNCATE TABLE ps_specific_price;				#  id_product *id_specific_price
TRUNCATE TABLE ps_specific_price_priority;	   # *id_product *id_specific_price_priority
# This one is special, links product to product
TRUNCATE TABLE ps_accessory;					 #  id_product_1  id_product_2
# Packs
TRUNCATE TABLE ps_pack;						  # *id_product_pack *id_product_item

# All these tables have an id_attachment primary key
TRUNCATE TABLE ps_attachment;	   # *id_attachment
TRUNCATE TABLE ps_attachment_lang;  # *id_attachment *id_lang

# All these tables have an id_attribute primary key
TRUNCATE TABLE ps_attribute;	   # *id_attribute id_attribute
TRUNCATE TABLE ps_attribute_lang;  # *id_attribute *id_lang

# All these tables have an id_attribute_group primary key
TRUNCATE TABLE ps_attribute_group;	  # *id_attribute_group
TRUNCATE TABLE ps_attribute_group_lang; # *id_attribute_group *id_lang

# All these tables have an id_attribute_impact primary key
TRUNCATE TABLE ps_attribute_impact;	 # *id_attribute_impact id_product id_attribute

# All these tables have an id_feature or id_feature_value key
TRUNCATE TABLE ps_feature;			 # *id_feature
TRUNCATE TABLE ps_feature_lang;		# *id_feature *id_lang
TRUNCATE TABLE ps_feature_value;	   # *id_feature_value  id_feature
TRUNCATE TABLE ps_feature_value_lang;  # *id_feature_value *id_lang

# All these tables have an id_customization_field key
TRUNCATE TABLE ps_customization_field;		   # *id_customization_field  id_product
TRUNCATE TABLE ps_customization_field_lang;	  # *id_customization_field *id_lang

# All these tables have an id_image primary key [or should have!]
TRUNCATE TABLE ps_image;		# *id_image  id_product
TRUNCATE TABLE ps_image_lang;   #  id_image  id_lang

# All these tables have an id_product_attribute primary key
TRUNCATE TABLE ps_product_attribute;			   # *id_product_attribute id_product
TRUNCATE TABLE ps_product_attribute_combination;   # *id_product_attribute *id_attribute
TRUNCATE TABLE ps_product_attribute_image;		 # *id_product_attribute *id_image

# All these tables have an id_product_download primary key
TRUNCATE TABLE ps_product_download;   # *id_product_download id_product

# All these tables have an id_word primary key
TRUNCATE TABLE ps_search_word;  # *id_word  id_lang

# All these tables have an id_tag primary key
# TRUNCATE TABLE ps_tag

# Empty carts
TRUNCATE TABLE ps_cart;			 # *id_cart ...
TRUNCATE TABLE ps_cart_discount;	#  id_cart
TRUNCATE TABLE ps_cart_product;	 #  id_cart id_product id_product_attribute
TRUNCATE TABLE ps_customization;	# *id_cart *id_customization *id_product
TRUNCATE TABLE ps_customized_data;  # *id_customization (see above)

# Delete Scenes
TRUNCATE TABLE ps_scene;			 # *id_scene
TRUNCATE TABLE ps_scene_category;	# *id_scene *id_category
TRUNCATE TABLE ps_scene_lang;		# *id_scene *id_lang
TRUNCATE TABLE ps_scene_products;	# *id_scene *id_product *x_axis *y_axis

# Delete stock movements
TRUNCATE TABLE ps_stock_mvt;  # *id_stock_mvt id_product ...