const t = require('tap');
const {
	BaseError,
	ServerError,
	UnauthorizedError,
	ForbiddenError,
	NotFoundError,
	UrlNotFoundError,
	errorsCreator
} = require('./');

t.test('errors', (t) => {
	t.test('BaseError', (t) => {
		t.test('default error', (t) => {
			const error = new BaseError();

			t.is(error.message, 'Error has occured');
			t.is(error.userMessage, 'Произошла ошибка');
			t.is(error.name, 'BaseError');
			t.match(error.stack, /^BaseError: Error has occured/);

			t.end();
		});

		t.test('extra fields', (t) => {
			const error = new BaseError({status: 500});

			t.is(error.status, 500);
			t.is(error.message, 'Error has occured');
			t.is(error.userMessage, 'Произошла ошибка');
			t.is(error.name, 'BaseError');
			t.match(error.stack, /^BaseError: Error has occured/);

			t.end();
		});

		t.test('simple error', (t) => {
			const error = new BaseError({
				message: 'error message',
				userMessage: 'user message'
			});

			t.is(error.message, 'error message');
			t.is(error.userMessage, 'user message');
			t.is(error.name, 'BaseError');
			t.match(error.stack, /^BaseError: error message/);

			t.end();
		});

		t.test('extend', (t) => {
			class NewError extends BaseError {}

			const error = new NewError({
				message: 'error message',
				userMessage: 'user message'
			});

			t.is(error.message, 'error message');
			t.is(error.userMessage, 'user message');
			t.is(error.name, 'NewError');
			t.match(error.stack, /^NewError: error message/);

			t.end();
		});

		t.test('message and userMessage as functions', (t) => {
			class NewError extends BaseError {
				constructor(params) {
					super({
						message: ({value}) => `value is ${value}`,
						userMessage: ({value}) => `value is ${value * 10}`,
						...params
					});
				}
			}

			const error = new NewError({value: 10});

			t.is(error.message, 'value is 10');
			t.is(error.userMessage, 'value is 100');
			t.is(error.name, 'NewError');
			t.match(error.stack, /^NewError: value is 10/);

			t.end();
		});

		t.end();
	});

	t.test('ServerError', (t) => {
		t.test('default error', (t) => {
			const error = new ServerError();

			t.is(error.message, 'Internal server error');
			t.is(error.userMessage, 'Внутренняя ошибка сервера');
			t.is(error.name, 'ServerError');
			t.is(error.status, 500);
			t.match(error.stack, /^ServerError: Internal server error/);

			t.end();
		});

		t.test('with message in constructor', (t) => {
			const error = new ServerError('new message');

			t.is(error.message, 'new message');
			t.is(error.userMessage, 'Внутренняя ошибка сервера');
			t.is(error.name, 'ServerError');
			t.is(error.status, 500);
			t.match(error.stack, /^ServerError: new message/);

			t.end();
		});

		t.end();
	});

	t.test('UnauthorizedError', (t) => {
		t.test('default error', (t) => {
			const error = new UnauthorizedError();

			t.is(error.message, 'Authentication is required');
			t.is(
				error.userMessage,
				'Для доступа к запрашиваемому ресурсу требуется аутентификация'
			);
			t.is(error.name, 'UnauthorizedError');
			t.is(error.status, 401);
			t.match(error.stack, /^UnauthorizedError: Authentication is required/);

			t.end();
		});

		t.end();
	});

	t.test('ForbiddenError', (t) => {
		t.test('default error', (t) => {
			const error = new ForbiddenError();

			t.is(error.message, 'Access denied');
			t.is(error.userMessage, 'Доступ запрещён');
			t.is(error.name, 'ForbiddenError');
			t.is(error.status, 403);
			t.match(error.stack, /^ForbiddenError: Access denied/);

			t.end();
		});

		t.end();
	});

	t.test('NotFoundError', (t) => {
		t.test('default error', (t) => {
			const error = new NotFoundError();

			t.is(error.message, 'Entity is not found');
			t.is(error.userMessage, 'Сущность не найдена');
			t.is(error.name, 'NotFoundError');
			t.is(error.status, 404);
			t.match(error.stack, /^NotFoundError: Entity is not found/);

			t.end();
		});

		t.end();
	});

	t.test('UrlNotFoundError', (t) => {
		t.test('default error', (t) => {
			const error = new UrlNotFoundError();

			t.is(error.message, 'Url is not found');
			t.is(error.userMessage, 'Страница не найдена');
			t.is(error.name, 'UrlNotFoundError');
			t.is(error.status, 404);
			t.match(error.stack, /^UrlNotFoundError: Url is not found/);

			t.end();
		});

		t.test('with url', (t) => {
			const error = new UrlNotFoundError({url: 'https://exmaple.com'});

			t.is(error.message, 'Url "https://exmaple.com" is not found');
			t.is(error.userMessage, 'Страница не найдена');
			t.is(error.name, 'UrlNotFoundError');
			t.is(error.status, 404);
			t.match(
				error.stack,
				/^UrlNotFoundError: Url "https:\/\/exmaple\.com" is not found/
			);

			t.end();
		});

		t.end();
	});

	t.test('errorsCreator', (t) => {
		t.test('default', (t) => {
			const errors = {};
			const create = errorsCreator(errors);

			create({name: 'MyError'});

			t.type(errors.MyError, 'function');

			const error = new errors.MyError();

			t.is(error.message, 'Internal server error');
			t.is(error.userMessage, 'Внутренняя ошибка сервера');
			t.is(error.name, 'MyError');
			t.is(error.status, 500);
			t.match(error.stack, /^MyError: Internal server error/);

			t.end();
		});

		t.test('custom messages', (t) => {
			const errors = {};
			const create = errorsCreator(errors);

			create({
				name: 'MyError',
				message: 'my message',
				userMessage: 'my user message'
			});

			t.type(errors.MyError, 'function');

			const error = new errors.MyError();

			t.is(error.message, 'my message');
			t.is(error.userMessage, 'my user message');
			t.is(error.name, 'MyError');
			t.is(error.status, 500);
			t.match(error.stack, /^MyError: my message/);

			t.end();
		});

		t.end();
	});

	t.end();
});
