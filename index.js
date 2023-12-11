const _ = require('underscore');

const defaultMessage = 'Error has occurred';
const defaultUserMessage = 'Произошла ошибка';

class BaseError extends Error {
	constructor({message, userMessage, ...params} = {}) {
		super(
			_(message).isFunction() ?
				message(params) :
				message || defaultMessage
		);

		this.userMessage = _(userMessage).isFunction() ?
			userMessage(params) :
			userMessage || defaultUserMessage;

		Object.defineProperty(this, 'name', {
			value: this.constructor.name,
			configurable: true,
			writable: true
		});

		Error.captureStackTrace(this, this.constructor);

		_(this).extend(params);
	}
}

class ServerError extends BaseError {
	constructor(params) {
		super({
			status: 500,
			message: 'Internal server error',
			userMessage: 'Внутренняя ошибка сервера',
			..._(params).isString() ? {message: params} : params
		});
	}
}

class UnauthorizedError extends BaseError {
	constructor(params) {
		super({
			status: 401,
			message: 'Authentication is required',
			userMessage: 'Для доступа к запрашиваемому ресурсу требуется аутентификация',
			...params
		});
	}
}

class ForbiddenError extends BaseError {
	constructor(params) {
		super({
			status: 403,
			message: 'Access denied',
			userMessage: 'Доступ запрещён',
			...params
		});
	}
}

class NotFoundError extends BaseError {
	constructor(params) {
		super({
			status: 404,
			message: 'Entity is not found',
			userMessage: 'Сущность не найдена',
			...params
		});
	}
}

class UrlNotFoundError extends NotFoundError {
	constructor(params) {
		super({
			message: ({url}) => `Url${url ? ` "${url}" ` : ' '}is not found`,
			userMessage: 'Страница не найдена',
			...params
		});
	}
}

exports.BaseError = BaseError;
exports.ServerError = ServerError;
exports.UnauthorizedError = UnauthorizedError;
exports.ForbiddenError = ForbiddenError;
exports.NotFoundError = NotFoundError;
exports.UrlNotFoundError = UrlNotFoundError;


exports.create = ({Parent = ServerError, ...params}) => class extends Parent {
	constructor(constructorParams) {
		super({
			...params,
			...constructorParams
		});
	}
};

exports.errorsCreator = (obj) => ({name, ...params}) => {
	obj[name] = exports.create(params);

	Object.defineProperty(obj[name], 'name', {
		value: name,
		configurable: true,
		writable: true
	});
};
