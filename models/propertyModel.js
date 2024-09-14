const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Property Name missing'],
			trim: true,
			
		},
		images: {
			heroImg: {
				type: String,
				
			},
			gallery: [{
				type: String
			}],
			floorMap: [{
				type: String
			}]
		},
		map: {
			type: String,
			lat: Number,
			long: Number
		},
		type: {
			type: String,
			enum: ['residential', 'commercial', 'villa', 'apartment'],
		},
		location: {
			lat: {
				type: Number,
				required: [true, 'Latitude is required']
			},
			long: {
				type: Number,
				required: [true, 'Longitude is required']
			},
			address: {
				type: String,
				required: [true, 'Address is required']
			},
			city: String,
			district: String,
			state: String,
			country: String,
			amenities: [{
				name: String,
				distance: {
					value: Number,
					unit: {
						type: String,
						enum: ['m', 'km']
					}
				}
			}]
		},
		
		features: {
			amenities: [{
				type: String
			}],
			renovations: [String],
			energyRating: String,
			smartFeatures: [String],
			views: [String],
		},
		lastRenovation: {
			value: Number,
			unit: {
				type: String,
				enum: ['years', "months"]
			}
		},
		listedBy: {
			name: String,
			link: String,
			contact: [{
				type: String,
				enum: ['phone', 'email']
			}]
		},
		description: {
			name: String,
		},
		layout: {
			size: {
				value: Number,
				unit: {
					type: String,
					enum: ['sqft', 'm2', 'acres']
				}
			},
			bedrooms: Number,
			kitchen: Number,
			bathrooms: Number,
		},
		occupancy: {
			type: String,
			enum: ['vacant', 'tenant', 'owned']
		},
		price: {
			value: Number,
			unit: {
				type: String,
				enum: []
			}
		},
		metadata: {
			mls: Number,
			datePosted: {
				type: Date,
				default: Date.now()
			},
			dateUpdated: {
				type: Date,
				default: Date.now()
			},
			views: {
				type: Number,
				default: 0
			},
			likes: {
				type: Number,
				default: 0
			}
		},
		

	}
);

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;